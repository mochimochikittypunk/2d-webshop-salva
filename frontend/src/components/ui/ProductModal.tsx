import { useStore } from '@nanostores/react';
import { motion, AnimatePresence } from 'framer-motion';
import { $selectedProduct, selectProduct } from '../../features/store/gameStore';

const PRODUCT_URLS: Record<number, string> = {
    1: 'https://salvador.supersale.jp/items/130339919',
    2: 'https://salvador.supersale.jp/items/74752871',
    3: 'https://salvador.supersale.jp/items/130310000',
    4: 'https://salvador.supersale.jp/items/127238259',
    5: 'https://salvador.supersale.jp/items/125166173',
    6: 'https://salvador.supersale.jp/items/123526831',
    7: 'https://salvador.supersale.jp/items/116275842',
    8: 'https://salvador.supersale.jp/items/114294392',
    9: 'https://salvador.supersale.jp/items/114294224',
    10: 'https://salvador.supersale.jp/items/111208414',
    11: 'https://salvador.supersale.jp/items/111208277',
    12: 'https://salvador.supersale.jp/items/107958273',
    13: 'https://salvador.supersale.jp/items/36867009',
    14: 'https://salvador.supersale.jp/items/29958134',
    15: 'https://salvador.supersale.jp/items/97290182',
    16: 'https://salvador.supersale.jp/items/30620592',
    17: 'https://salvador.supersale.jp/items/95306619',
    18: 'https://salvador.supersale.jp/items/86213221',
    19: 'https://salvador.supersale.jp/items/86212288',
    20: 'https://salvador.supersale.jp/items/84936956',
};

export const ProductModal = () => {
    const product = useStore($selectedProduct);

    if (!product) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-auto"
                onClick={() => selectProduct(null)} // Close on background click (cast null to any because strict null check might complain if not adjusted in store type but it accepts null)
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="h-64 md:h-auto bg-zinc-800 flex items-center justify-center p-8">
                            <img src={product.image_url || '/item-coffee.png'} alt={product.name} className="max-h-full object-contain filter drop-shadow-lg" />
                        </div>
                        <div className="p-6 flex flex-col">
                            <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
                            <p className="text-yellow-400 text-xl font-mono mb-4">¥{product.price.toLocaleString()}</p>

                            <p className="text-gray-300 text-sm flex-1 mb-6 leading-relaxed whitespace-pre-wrap">
                                {product.description}
                            </p>

                            <div className="space-y-3 mt-auto">
                                {(() => {
                                    const url = PRODUCT_URLS[Number(product.id)];
                                    if (!url) console.warn(`Product URL not found for ID: ${product.id}`);

                                    return (
                                        <a
                                            href={url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!url) alert('商品ページが見つかりませんでした。');
                                            }}
                                        >
                                            <span>商品を見てみる！</span>
                                        </a>
                                    );
                                })()}

                                <button
                                    onClick={() => selectProduct(null)}
                                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
