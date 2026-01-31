import { useStore } from '@nanostores/react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { $chatHistory, $isChatOpen, $highlightedProductId } from '../../features/store/gameStore';

// 商品キーワードマッピング（商品名の一部 → 商品ID）
const PRODUCT_KEYWORDS: Record<string, number> = {
    'インフィニティ': 1,
    'スカイプロジェクト': 1,
    'Newbie': 2,
    'ンディミ': 3,
    'チェルベサ': 4,
    'ブク・アベル': 5,
    'ブクアベル': 5,
    'プリマヴェーラ': 6,
    'パパヨ': 6,
    'エル セドラル': 7,
    'エルセドラル': 7,
    'ニャマシェケ': 8,
    'オレンジソルベ': 8,
    'ギテシ': 9,
    'カロンギ': 9,
    'マドリッド': 10,
    'キアンゴイ': 11,
    'ブク サイサ': 12,
    'バブルガム': 12,
    'ドン・ハイメ': 13,
    'パカマラ': 13,
    '紬凪': 14,
    'つむぎ': 14,
    'うつろい': 15,
    '魔法ブレンド': 16,
    '風穴': 17,
    'マンデリン': 18,
    'ディカフェ': 18, // 複数あるが18を優先
    'ブラジル': 20,
};

// AIの返答からおすすめ商品を検出してハイライト
function detectAndHighlightProduct(aiResponse: string): void {
    for (const [keyword, productId] of Object.entries(PRODUCT_KEYWORDS)) {
        if (aiResponse.includes(keyword)) {
            $highlightedProductId.set(productId);
            // 5秒後にハイライト解除
            setTimeout(() => {
                $highlightedProductId.set(null);
            }, 5000);
            return; // 最初にマッチしたものだけ
        }
    }
}

const GAS_LOG_URL = 'https://script.google.com/macros/s/AKfycbw7_kh2fV9USb1xrxSY6mL3GtAf_i1zeRRru63tumzknmYqYZUutbZxwspsvlm6rOuZ/exec';

// Log chat history to Google Spreadsheet
const logChatToSheet = async (history: any[], note: string = '') => {
    try {
        // Filter out system messages if any, keep only user/salva
        const validHistory = history.filter(msg => msg.role === 'user' || msg.role === 'salva');

        if (validHistory.length === 0) return;

        await fetch(GAS_LOG_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for GAS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                history: validHistory,
                userId: 'user_' + Math.random().toString(36).substr(2, 9), // Simple session ID
                note: note
            })
        });
        console.log('Chat history logged to sheet');
    } catch (e) {
        console.error('Failed to log chat:', e);
    }
};

export const ChatWindow = () => {
    const isOpen = useStore($isChatOpen);
    const history = useStore($chatHistory);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    // Add local state for typing indicator
    const [isTyping, setIsTyping] = useState(false);

    const handleSendMessage = async () => {
        if (!inputRef.current) return;
        const message = inputRef.current.value.trim();
        if (!message) return;

        // Clear input
        inputRef.current.value = '';
        inputRef.current.focus();

        // Add User Message
        const { addChatMessage, $chatHistory } = await import('../../features/store/gameStore');
        addChatMessage('user', message);

        // Set typing status
        setIsTyping(true);

        // Call external AI Salva API
        try {
            const currentHistory = $chatHistory.get();
            const apiHistory = currentHistory.map((msg: { role: string; content: string }) => ({
                role: msg.role === 'salva' ? 'bot' : 'user',
                content: msg.content
            }));

            const response = await fetch('https://ai-salva-chat.vercel.app/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: apiHistory,
                    isExternal: true
                }),
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            // User requested to remove markdown '**' logs
            const aiResponse = (data.response || 'すみません、うまく聞き取れませんでした。').replace(/\*\*/g, '');

            // 商品ハイライト検出
            detectAndHighlightProduct(aiResponse);

            $chatHistory.set([...$chatHistory.get(), {
                role: 'salva',
                content: aiResponse
            }]);
        } catch (err) {
            console.error('AI Salva API Error:', err);
            $chatHistory.set([...$chatHistory.get(), {
                role: 'salva',
                content: 'すみません、今ちょっと調子が悪くて…もう一度話しかけてくれる？'
            }]);
        } finally {
            // Clear typing status
            setIsTyping(false);
        }
    };

    // Auto-scroll to bottom when history changes or typing starts
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [history, isTyping]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="absolute bottom-4 left-4 right-4 md:left-[20%] md:right-[20%] bg-black/80 border-2 border-white/20 backdrop-blur-md rounded-lg p-4 h-48 flex flex-col pointer-events-auto group"
                >
                    {/* Reset Button */}
                    <button
                        onClick={() => {
                            import('../../features/store/gameStore').then(({ $chatHistory, INITIAL_CHAT_HISTORY }) => {
                                const currentHistory = $chatHistory.get();
                                logChatToSheet(currentHistory, 'Manual Reset'); // Log on manual reset
                                $chatHistory.set(INITIAL_CHAT_HISTORY);
                            });
                            setIsTyping(false);
                        }}
                        className="absolute top-2 right-2 text-[10px] text-zinc-400 hover:text-white border border-zinc-600 hover:border-zinc-400 rounded px-2 py-0.5 transition-colors z-10"
                    >
                        ↻ 最初に戻る
                    </button>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 mb-1 pr-1">
                        {history.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`px-2 py-1 rounded-lg text-xs md:text-sm whitespace-pre-wrap max-w-full md:max-w-[600px] ${msg.role === 'user'
                                        ? 'bg-blue-600/50 text-white'
                                        : 'bg-yellow-600/20 text-yellow-100 border border-yellow-500/30'
                                        }`}>
                                        {msg.role === 'salva' && <span className="mr-2 font-bold text-yellow-400">Salva</span>}
                                        {msg.content}
                                    </span>
                                </div>
                                {msg.role === 'salva' && msg.options && idx === history.length - 1 && (
                                    <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
                                        {msg.options.map((opt, optIdx) => (
                                            <button
                                                key={optIdx}
                                                className="text-left text-[10px] md:text-xs bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-200 py-1 px-2 rounded transition-colors truncate"
                                                onClick={async () => {
                                                    // Add user message
                                                    import('../../features/store/gameStore').then(({ addChatMessage }) => {
                                                        addChatMessage('user', opt.value);
                                                    });

                                                    // Special Logic for Dating Sim
                                                    if (opt.action && opt.action.startsWith('dating_')) {
                                                        setIsTyping(true); // Start typing simulation
                                                        setTimeout(() => {
                                                            import('../../features/store/gameStore').then(({ $chatHistory }) => {
                                                                const history = $chatHistory.get();
                                                                let nextMessage = null;
                                                                let nextOptions: any[] = [];

                                                                // Step 1: Start -> Confession
                                                                if (opt.action === 'dating_start') {
                                                                    nextMessage = 'えっ…？ どうしたの、そんな熱っぽい目をして…';
                                                                    nextOptions = [
                                                                        { label: '1. 好きです！付き合ってください！', value: '好きです！', action: 'dating_1_confess' },
                                                                        { label: '2. なんでもないです', value: 'なんでもない…', action: 'dating_end_shy' }
                                                                    ];
                                                                }
                                                                // Step 2: Workaholic Check
                                                                else if (opt.action === 'dating_1_confess') {
                                                                    nextMessage = 'いきなりだね…。でも、ごめん。僕は店とコーヒーのことで頭がいっぱいなんだ。恋愛してる暇なんてないんだよ。';
                                                                    nextOptions = [
                                                                        { label: '1. 私がお店手伝います！', value: '私が手伝います！', action: 'dating_2_help' },
                                                                        { label: '2. デートの時くらい休んでよ〜', value: 'たまには休みましょうよ', action: 'dating_2_rest' }
                                                                    ];
                                                                }
                                                                // Step 3: BAD END - Value mismatch
                                                                else if (opt.action === 'dating_2_rest') {
                                                                    nextMessage = '休みたくないんだ。コーヒーは僕の人生だからね。君とは価値観が合わないみたいだ。';
                                                                    nextOptions = [{ label: 'BAD END: 価値観の違い (最初に戻る)', value: 'そうですか…', action: 'reset', note: 'BAD END: 価値観' }];
                                                                }
                                                                // Step 4: Capability Check
                                                                else if (opt.action === 'dating_2_help') {
                                                                    nextMessage = '手伝うって…君に何ができるの？ コーヒーの知識はあるの？ 生半可な気持ちじゃ困るんだけど。';
                                                                    nextOptions = [
                                                                        { label: '1. 元気だけはあります！', value: '元気なら誰にも負けません！', action: 'dating_3_energy' },
                                                                        { label: '2. 最高のお菓子を作れます', value: '最高のお菓子を作れます', action: 'dating_3_skill' }
                                                                    ];
                                                                }
                                                                // Step 5: Energy path - need to prove worth
                                                                else if (opt.action === 'dating_3_energy') {
                                                                    nextMessage = '元気かぁ…悪くないけど、それだけじゃ「必要性」は感じられないかな。何か具体的にできることはある？';
                                                                    nextOptions = [
                                                                        { label: '1. コーヒーの勉強します！', value: '勉強します！', action: 'dating_4_study' },
                                                                        { label: '2. 諦めます…', value: '諦めます…', action: 'dating_4_giveup' }
                                                                    ];
                                                                }
                                                                // Step 6: BAD END - Give up
                                                                else if (opt.action === 'dating_4_giveup') {
                                                                    nextMessage = 'そう…残念だけど、お互いのためだと思うよ。また普通のお客さんとして来てね。';
                                                                    nextOptions = [{ label: 'BAD END: 諦め (最初に戻る)', value: 'はい…', action: 'reset', note: 'BAD END: 諦め' }];
                                                                }
                                                                // Step 7: Study path
                                                                else if (opt.action === 'dating_4_study') {
                                                                    nextMessage = '勉強する気持ちは評価するよ。じゃあ試しに、僕のブレンドに合う何かを作ってみてくれる？';
                                                                    nextOptions = [
                                                                        { label: '1. コーヒーゼリー作ります！', value: 'コーヒーゼリー！', action: 'dating_5_jelly' },
                                                                        { label: '2. カフェオレ作ります！', value: 'カフェオレ！', action: 'dating_5_latte' }
                                                                    ];
                                                                }
                                                                // Step 8: BAD END - Not creative
                                                                else if (opt.action === 'dating_5_latte') {
                                                                    nextMessage = 'カフェオレ…？ それなら僕も作れるんだけど。君じゃなきゃダメな理由が見つからないな。';
                                                                    nextOptions = [{ label: 'BAD END: 個性不足 (最初に戻る)', value: 'そうですよね…', action: 'reset', note: 'BAD END: 個性不足' }];
                                                                }
                                                                // Step 9: Jelly path -> leads to interest
                                                                else if (opt.action === 'dating_5_jelly') {
                                                                    nextMessage = 'コーヒーゼリー？ 面白いね。作ってみて…\n\n…うん、これは美味しい。うちのブレンドの苦味が活きてる。センスあるじゃん。';
                                                                    nextOptions = [
                                                                        { label: '1. もっと色々作れますよ！', value: 'もっと作れます！', action: 'dating_6_more' },
                                                                        { label: '2. ありがとうございます…', value: 'ありがとう', action: 'dating_6_humble' }
                                                                    ];
                                                                }
                                                                // Step 10: Skill path - business or love
                                                                else if (opt.action === 'dating_3_skill') {
                                                                    nextMessage = 'お菓子…？ うちのブレンドは深煎りで酸味が強いから、甘いマリアージュがあれば完璧かも…。';
                                                                    nextOptions = [
                                                                        { label: '1. ビジネスパートナーとしてどう？', value: 'ビジネスパートナーとして', action: 'dating_4_biz' },
                                                                        { label: '2. 公私ともに支えます！', value: '公私ともに支えます！', action: 'dating_4_love' }
                                                                    ];
                                                                }
                                                                // Step 11: NORMAL END - Business only
                                                                else if (opt.action === 'dating_4_biz') {
                                                                    nextMessage = 'ビジネスパートナーか…いいね。じゃあまずは履歴書持ってきて。面接しようか。';
                                                                    nextOptions = [{ label: 'NORMAL END: 就職 (最初に戻る)', value: 'はい、履歴書…', action: 'reset', note: 'NORMAL END: 就職' }];
                                                                }
                                                                // Step 12: Love path -> date invitation
                                                                else if (opt.action === 'dating_4_love') {
                                                                    nextMessage = '公私ともに…か。…参ったな。君と一緒にいると、なんだか落ち着く。';
                                                                    nextOptions = [
                                                                        { label: '1. 私もです…', value: '私もです', action: 'dating_7_mutual' },
                                                                        { label: '2. え、本当ですか！？', value: '本当ですか！？', action: 'dating_7_surprised' }
                                                                    ];
                                                                }
                                                                // Step 13: More sweets offer
                                                                else if (opt.action === 'dating_6_more') {
                                                                    nextMessage = 'へぇ…それは楽しみだな。今度、新メニューの試作を一緒にやらない？';
                                                                    nextOptions = [{ label: '1. ぜひ！', value: 'ぜひ！', action: 'dating_8_date' }];
                                                                }
                                                                // Step 14: Humble response
                                                                else if (opt.action === 'dating_6_humble') {
                                                                    nextMessage = '謙虚だね。…でも、自信持っていいと思うよ。君のお菓子、もっと食べてみたい。';
                                                                    nextOptions = [{ label: '1. 喜んで作ります！', value: '喜んで！', action: 'dating_8_date' }];
                                                                }
                                                                // Step 15: Mutual feelings
                                                                else if (opt.action === 'dating_7_mutual') {
                                                                    nextMessage = '…そっか。なら…今度の休み、二人で出かけない？ 新しいコーヒー豆を仕入れに行くんだけど。';
                                                                    nextOptions = [{ label: '1. 行きます！', value: '行きます！', action: 'dating_9_final' }];
                                                                }
                                                                // Step 16: Surprised reaction
                                                                else if (opt.action === 'dating_7_surprised') {
                                                                    nextMessage = 'ふふ、本当だよ。…ねぇ、今度一緒にコーヒー豆の買い付けに行かない？ 二人で。';
                                                                    nextOptions = [{ label: '1. デート…ですか？', value: 'デートですか？', action: 'dating_9_final' }];
                                                                }
                                                                // Step 17: Date invitation from study path
                                                                else if (opt.action === 'dating_8_date') {
                                                                    nextMessage = '…あのさ、今度の日曜、空いてる？ 新しい産地のコーヒー豆を見に行くんだけど、君も来ない？';
                                                                    nextOptions = [{ label: '1. デート…ですか！？', value: 'デートですか！？', action: 'dating_9_final' }];
                                                                }
                                                                // Step 18: HAPPY END - Date confirmed!
                                                                else if (opt.action === 'dating_9_final') {
                                                                    nextMessage = 'デート…まぁ、そういうことになるのかな。\n\n…楽しみにしてるよ。';
                                                                    nextOptions = [{ label: '★ HAPPY END ★ デートの約束 (最初に戻る)', value: 'やったー！', action: 'reset', note: 'HAPPY END' }];
                                                                }
                                                                // Neutral End - Shy
                                                                else if (opt.action === 'dating_end_shy') {
                                                                    nextMessage = 'なんだ、びっくりさせないでよ。コーヒーでも飲む？ 落ち着くよ。';
                                                                    nextOptions = [{ label: '最初に戻る', value: 'うん', action: 'reset', note: 'Shy End' }];
                                                                }

                                                                if (nextMessage) {
                                                                    $chatHistory.set([...history, {
                                                                        role: 'salva',
                                                                        content: nextMessage,
                                                                        options: nextOptions
                                                                    }]);
                                                                }
                                                                setIsTyping(false); // Stop typing
                                                            });
                                                        }, 600); // Delay for realism
                                                        return;
                                                    }

                                                    // Reset Logic (Fix for bug where reset triggers API call)
                                                    if (opt.action === 'reset') {
                                                        import('../../features/store/gameStore').then(({ INITIAL_CHAT_HISTORY, $chatHistory }) => {
                                                            const currentHistory = $chatHistory.get();
                                                            // Use note if available in the option (for endings), otherwise standard Reset
                                                            logChatToSheet(currentHistory, opt.note || 'Reset Action');
                                                            $chatHistory.set(INITIAL_CHAT_HISTORY);
                                                        });
                                                        setIsTyping(false);
                                                        return;
                                                    }

                                                    // Standard API Call for normal commands (1-3)
                                                    // Call external AI Salva API
                                                    setIsTyping(true);
                                                    try {
                                                        // Convert history format: 'salva' -> 'bot'
                                                        const apiHistory = history.map((msg: { role: string; content: string }) => ({
                                                            role: msg.role === 'salva' ? 'bot' : 'user',
                                                            content: msg.content
                                                        }));

                                                        const response = await fetch('https://ai-salva-chat.vercel.app/api/chat', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                                message: opt.value,
                                                                history: apiHistory,
                                                                isExternal: true // Short response mode
                                                            }),
                                                        });

                                                        if (!response.ok) {
                                                            throw new Error(`API Error: ${response.status}`);
                                                        }

                                                        const data = await response.json();
                                                        const aiResponse = data.response || 'すみません、うまく聞き取れませんでした。';

                                                        // 商品ハイライト検出
                                                        detectAndHighlightProduct(aiResponse);

                                                        // Add AI response to chat WITHOUT options (text input mode)
                                                        import('../../features/store/gameStore').then(({ $chatHistory }) => {
                                                            const currentHistory = $chatHistory.get();
                                                            $chatHistory.set([...currentHistory, {
                                                                role: 'salva',
                                                                content: aiResponse
                                                                // No options = text input mode
                                                            }]);
                                                        });
                                                    } catch (err) {
                                                        console.error('AI Salva API Error:', err);
                                                        // Fallback message on error (no options = text input mode)
                                                        import('../../features/store/gameStore').then(({ $chatHistory }) => {
                                                            const currentHistory = $chatHistory.get();
                                                            $chatHistory.set([...currentHistory, {
                                                                role: 'salva',
                                                                content: 'すみません、今ちょっと調子が悪くて…もう一度話しかけてくれる？'
                                                            }]);
                                                        });
                                                    } finally {
                                                        setIsTyping(false);
                                                    }
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-yellow-600/20 text-yellow-100 border border-yellow-500/30 px-3 py-2 rounded-lg text-xs md:text-sm flex items-center gap-1">
                                    <span className="mr-2 font-bold text-yellow-400">Salva</span>
                                    <span className="animate-pulse">入力中...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-2 items-center">
                        <textarea
                            ref={inputRef}
                            placeholder="店主になにか聞く... (Enter 2回で送信)"
                            className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 resize-none h-12 leading-normal"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const target = e.target as HTMLTextAreaElement;
                                    const now = Date.now();
                                    const lastEnter = parseInt(target.dataset.lastEnter || '0');

                                    if (now - lastEnter < 500) {
                                        e.preventDefault();
                                        handleSendMessage();
                                        target.dataset.lastEnter = '0';
                                    } else {
                                        target.dataset.lastEnter = now.toString();
                                    }
                                }
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg px-4 h-12 flex items-center justify-center transition-colors shadow-lg active:scale-95 whitespace-nowrap"
                        >
                            送信
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
