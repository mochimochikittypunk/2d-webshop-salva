import { useEffect } from 'react';
import { ShopScene } from './features/game/ShopScene';
import { ChatWindow } from './components/ui/ChatWindow';
import { ProductModal } from './components/ui/ProductModal';
import { MusicButton } from './components/ui/MusicButton';
import { fetchProducts } from './lib/api';
import { $allProducts } from './features/store/gameStore';

function App() {
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
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <ShopScene />

      {/* UI Overlay Placeholder */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">

        {/* Top Bar */}
        <div className="flex justify-start pointer-events-auto">
          <MusicButton />
        </div>


        {/* Chat Window */}
        <ChatWindow />

        {/* Product Modal */}
        <ProductModal />
      </div>
    </div>
  );
}

export default App;
