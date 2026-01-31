import React, { useEffect } from 'react';
import { ShopScene } from './features/game/ShopScene';
import { ChatWindow } from './components/ui/ChatWindow';
import { ProductModal } from './components/ui/ProductModal';
import { MusicButton } from './components/ui/MusicButton';
import { fetchProducts } from './lib/api';
import { $allProducts } from './features/store/gameStore';

function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    console.log('[App] Starting fetchProducts...');
    fetchProducts().then(products => {
      console.log('[App] Loaded products successfully:', products.length, products);
      $allProducts.set(products);
    }).catch(err => {
      console.error('[App] Failed to fetch products:', err);
      // Optional: Show UI error
    });
  }, []);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-black supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]">
      <ShopScene onLoadComplete={() => setTimeout(() => setIsLoading(false), 800)} />

      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white transition-opacity duration-1000">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A373] mb-4"></div>
          <p className="text-xl font-serif text-[#E9D8A6] animate-pulse">サルバさんを呼び出しています...</p>
        </div>
      )}

      {/* UI Overlay Placeholder */}
      <div className={`absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>

        {/* Top Bar */}
        <div className="flex justify-start pointer-events-auto">
          <MusicButton />
        </div>


        {/* Chat Window */}
        <ChatWindow />
      </div>

      {/* Product Modal */}
      <ProductModal />
    </div>
  );
}

export default App;
