import { useStore } from '@nanostores/react';
import { motion, AnimatePresence } from 'framer-motion';
import { $selectedProduct, selectProduct } from '../../features/store/gameStore';

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
                                    // Parse metadata safely to get URL
                                    let url = '#';
                                    try {
                                        const meta = typeof product.metadata === 'string' ? JSON.parse(product.metadata) : product.metadata;
                                        if (meta && meta.url) url = meta.url;
                                    } catch (e) { console.error('Failed to parse metadata', e); }

                                    return (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            onClick={() => {
                                                // Prevent closing modal? Or maybe close it after clicking?
                                                // e.stopPropagation(); 
                                            }}
                                        >
                                            <span>👀 商品ページをみてみる</span>
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
