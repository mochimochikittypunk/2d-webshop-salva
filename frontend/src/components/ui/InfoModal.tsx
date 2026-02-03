import { motion, AnimatePresence } from 'framer-motion';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-800 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                            aria-label="閉じる"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto max-h-[80vh] p-6 md:p-8">
                            <article className="prose prose-sm md:prose-base max-w-none text-gray-800">
                                <h1 className="text-xl md:text-2xl font-bold text-amber-800 mb-4">
                                    専属のAIエージェントがあなた好みのスペシャルティコーヒーをご提案
                                </h1>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    ネット通販でコーヒー豆を買うとき、「酸味が苦手」「苦いのは嫌」といった説明だけでは、本当に自分好みのコーヒーを見つけるのは難しいものです。
                                    AIサルバさんは、対話形式であなたの好みを細かく分析。「フルーティーなもの」「深煎りでどっしり」など、
                                    友達に話すような自然な言葉で相談するだけで、あなたにぴったりのスペシャルティコーヒーをご提案します。
                                    もうコーヒー選びで失敗することはありません。
                                </p>

                                <h2 className="text-lg md:text-xl font-bold text-amber-700 mt-8 mb-3">
                                    札幌の自家焙煎店から、焙煎したての香りを全国へお届け
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    Salvador Coffeeは、札幌・石山通に実店舗を構える自家焙煎スペシャルティコーヒー専門店です。
                                    <strong className="text-amber-800">日本一になったことのある焙煎技術</strong>と、
                                    産地への直接買付による高品質な生豆の仕入れが私たちの強み。
                                    ご注文をいただいてから焙煎し、新鮮な状態で全国へ発送しています。
                                    焙煎したての香り高いコーヒーをぜひご自宅でお楽しみください。
                                </p>

                                <h2 className="text-lg md:text-xl font-bold text-amber-700 mt-8 mb-3">
                                    毎日のコーヒーを迷わない。お得な定期便（サブスク）
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    「毎回注文するのが面倒」「何を選べばいいかわからない」という方には、
                                    定期便（サブスクリプション）がおすすめです。
                                    あなたの好みに合わせて選んだ豆や、毎月届く新商品のコーヒー豆を定額でお届け。
                                    いつも新鮮で美味しいコーヒーが、手間なくご自宅に届きます。
                                </p>

                                <h2 className="text-lg md:text-xl font-bold text-amber-700 mt-8 mb-3">
                                    AIサルバさんの使い方
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    使い方はとても簡単。画面下のチャットに話しかけるだけです。
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                                    <li>「苦くないのがいい」</li>
                                    <li>「フルーティーなやつ」</li>
                                    <li>「酸味が苦手だけどおすすめは？」</li>
                                </ul>
                                <p className="text-gray-700 leading-relaxed">
                                    こんな風に、友達に話しかけるように相談してみてください。
                                    AIサルバさんがあなたにぴったりのコーヒーをご紹介します。
                                    気になる商品が見つかったら、そのまま通販ページ（
                                    <a
                                        href="https://salvador.supersale.jp/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 hover:text-amber-800 underline"
                                    >
                                        salvador.supersale.jp
                                    </a>
                                    ）へご案内いたします。
                                </p>
                            </article>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
