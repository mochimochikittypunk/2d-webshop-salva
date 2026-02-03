import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
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
                        <div className="overflow-y-auto max-h-[85vh] p-6 md:p-8">
                            <article className="prose prose-sm max-w-none text-gray-800">
                                <h1 className="text-xl md:text-2xl font-bold text-amber-800 mb-4">
                                    AIサルバさんチャット 利用規約
                                </h1>
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    この利用規約（以下「本規約」といいます。）は、Salvador Coffee（以下「当店」といいます。）が提供するAIチャットボットサービス「AIサルバさん」（以下「本サービス」といいます。）の利用条件を定めるものです。本サービスのチャット送信ボタンを押下し、メッセージを送信した時点で、本規約に同意したものとみなされます。
                                </p>

                                <h2 className="text-lg font-bold text-amber-700 mt-6 mb-3">
                                    第1条（目的）
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    本サービスは、Google社の生成AI技術を活用し、当店の商品案内、コーヒーに関する相談、および日常会話等を楽しむことを目的とした補助ツールです。
                                </p>

                                <h2 className="text-lg font-bold text-amber-700 mt-6 mb-3">
                                    第2条（AI回答の性質と免責事項）
                                </h2>
                                <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">情報の正確性について</h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    本サービスはAI（人工知能）によって自動生成された回答を提供します。当店は情報の正確性には細心の注意を払っておりますが、AIが生成する回答が常に正確であること、完全であること、最新であることを保証するものではありません。特に、商品価格、在庫状況、原材料、アレルギー情報等については、必ず公式オンラインショップの最新情報をご確認ください。
                                </p>
                                <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">「幻覚（ハルシネーション）」について</h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    生成AIの特性上、事実と異なる情報や、架空の情報を「もっともらしく」回答する（ハルシネーション）場合があります。AIの回答のみを根拠として損害が生じた場合でも、当店は一切の責任を負いません。
                                </p>
                                <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">健康・医療に関する情報</h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    コーヒーの効能や健康への影響に関する話題が出る場合がありますが、これらは一般的な情報提供に留まり、医学的な助言や診断を代替するものではありません。
                                </p>

                                <h2 className="text-lg font-bold text-amber-700 mt-6 mb-3">
                                    第3条（個人情報の取扱い）
                                </h2>
                                <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">個人情報の入力禁止</h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    チャット欄には、氏名、住所、電話番号、クレジットカード番号、パスワードなどの個人情報や機密情報は絶対に入力しないでください。
                                </p>
                                <h3 className="text-base font-semibold text-gray-800 mt-4 mb-2">データの利用</h3>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    ユーザーとの会話データは、AIの回答精度向上の目的やシステムエラーの修正のために利用される場合があります。また、本サービスはGoogle Gemini APIを利用しており、送信されたデータはGoogle社のプライバシーポリシーに従って処理されます。
                                </p>

                                <h2 className="text-lg font-bold text-amber-700 mt-6 mb-3">
                                    第4条（禁止事項）
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-2">
                                    ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                                </p>
                                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                                    <li>法令または公序良俗に違反する行為</li>
                                    <li>当店、他のユーザー、または第三者の権利を侵害する行為</li>
                                    <li>AIに対して暴力的、性的、差別的なメッセージを送信する行為</li>
                                    <li>本サービスのサーバーやネットワークに過度な負荷をかける行為</li>
                                    <li>プロンプトインジェクション等、AIの挙動を意図的に操作・破壊しようとする行為</li>
                                </ul>

                                <h2 className="text-lg font-bold text-amber-700 mt-6 mb-3">
                                    第5条（サービスの変更・中断・終了）
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    当店は、ユーザーに通知することなく、本サービスの内容を変更し、または提供を中断・終了することができるものとします。これによってユーザーに生じた損害について、当店は一切の責任を負いません。
                                </p>

                                <h2 className="text-lg font-bold text-amber-700 mt-6 mb-3">
                                    第6条（リンク先の利用）
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    本サービス内で提案される外部リンク（他社サイト等）の有用性や安全性について、当店は保証しません。リンク先の利用はユーザーの責任において行ってください。
                                </p>
                            </article>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
