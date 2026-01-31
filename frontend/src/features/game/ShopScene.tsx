import { useEffect, useRef } from 'react';
import { Application, Assets, Sprite, Graphics, Text, TextStyle, Polygon } from 'pixi.js';

interface ShopSceneProps {
    onLoadComplete?: () => void;
}

export const ShopScene = ({ onLoadComplete }: ShopSceneProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize PixiJS Application
        const initApp = async () => {
            // Clean up previous instance if exists (Hot Reload handling)
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }

            const app = new Application();

            await app.init({
                background: '#000000',
                resizeTo: window,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            if (containerRef.current) {
                containerRef.current.appendChild(app.canvas);
                appRef.current = app;
            }

            // Load Assets
            const bgTexture = await Assets.load('/bg-shop.png');
            const guideTexture = await Assets.load('/asset-sample1.png'); // Reference Guide

            // Preload known product assets
            const coffeeTexture = await Assets.load('/item-coffee.png');

            // Load Salva Expressions
            const salvaTextures = {
                normal: await Assets.load('/char-salva-transparent.png'),
                happy: await Assets.load('/char-salva-happy-transparent.png'),
                surprised: await Assets.load('/char-salva-surprised-transparent.png'),
            };

            const background = new Sprite(bgTexture);
            background.anchor.set(0.5);
            background.x = app.screen.width / 2;
            background.y = app.screen.height / 2;

            // ... Scaling logic for background ...
            const scaleX = app.screen.width / background.width;
            const scaleY = app.screen.height / background.height;
            const scale = Math.max(scaleX, scaleY);
            background.scale.set(scale);
            app.stage.addChild(background);

            // Fetch Products from API
            try {
                // Dynamic import to avoid top-level await issues if any, or just import at top
                const { fetchProducts } = await import('../../lib/api');
                const products: any[] = await fetchProducts(); // Use any for now or shared type

                products.forEach((p) => {
                    // Mapping logic: if slug is 'coffee-bean-001', place at specific spot
                    if (p.slug === 'coffee-bean-001') {
                        const productSprite = new Sprite(coffeeTexture);
                        productSprite.anchor.set(0.5);
                        productSprite.x = app.screen.width * 0.7; // Shelf Right
                        productSprite.y = app.screen.height * 0.4; // Slightly higher
                        productSprite.scale.set(0.4); // Responsive logic handled in resize

                        productSprite.eventMode = 'static';
                        productSprite.cursor = 'pointer';
                        productSprite.on('pointerdown', () => {
                            import('../../features/store/gameStore').then(({ selectProduct }) => {
                                selectProduct({
                                    id: p.id, // Now using number
                                    slug: p.slug,
                                    name: p.name,
                                    price: p.price,
                                    description: p.description,
                                    image_url: p.image_url,
                                    metadata: p.metadata
                                });
                            });
                        });

                        // Tag sprite for resize handling
                        (productSprite as any).isProduct = true;
                        app.stage.addChild(productSprite);
                    }
                });

            } catch (e) {
                console.error("Failed to load products", e);
            }


            // Salva Textures
            const salvaTexturesNew = {
                normal: await Assets.load('/char-salva-transparent.png'),
                happy: await Assets.load('/char-salva-happy-transparent.png'),
                surprised: await Assets.load('/char-salva-surprised-transparent.png'),
                dating: await Assets.load('/toki-memo.PNG') // Hi-res Tokimeki Mode
            };

            const salva = new Sprite(salvaTexturesNew.normal);
            salva.anchor.set(0.5);
            // Center Salva
            salva.x = app.screen.width / 2;
            salva.y = app.screen.height * 0.65; // User Feedback: Move down (was 0.58)

            // Scales
            const NORMAL_SCALE = 0.35;
            const DATING_SCALE = 0.50; // Larger for Tokimeki mode (approx 1.4x normal)

            salva.scale.set(NORMAL_SCALE);

            salva.eventMode = 'static';
            salva.cursor = 'pointer';

            // Define precise HitArea to ignore transparent corners
            const updateHitArea = (isDating: boolean) => {
                const tex = salva.texture;
                const sw = tex.width;
                const sh = tex.height;
                // Reset hit area if null or if switching modes
                if (isDating) {
                    // Tokimeki sprite might have different transparency/shape
                    // For now, use a simple box or approximation
                    salva.hitArea = new Polygon([
                        -sw * 0.4, -sh * 0.4,
                        sw * 0.4, -sh * 0.4,
                        sw * 0.4, sh * 0.5,
                        -sw * 0.4, sh * 0.5
                    ]);
                } else {
                    // Original approximate polygon
                    salva.hitArea = new Polygon([
                        -sw * 0.2, -sh * 0.45, // Top Left Head
                        sw * 0.2, -sh * 0.45,  // Top Right Head
                        sw * 0.3, -sh * 0.2,   // Ear Right
                        sw * 0.45, sh * 0.1,   // Shoulder Right
                        sw * 0.45, sh * 0.5,   // Bottom Right
                        -sw * 0.45, sh * 0.5,  // Bottom Left
                        -sw * 0.45, sh * 0.1,  // Shoulder Left
                        -sw * 0.3, -sh * 0.2   // Ear Left
                    ]);
                }
            };
            updateHitArea(false);

            // Subscribe to chat history to switch modes
            import('../../features/store/gameStore').then(({ $chatHistory }) => {
                $chatHistory.subscribe(history => {
                    if (history.length === 0) return;
                    const lastMsg = history[history.length - 1];
                    // Check if *any* option in the last message is a dating action? 
                    // No, check if the *previous* user choice led to a dating state.
                    // Actually, easiest is to check if the last message has options with 'dating_' actions,
                    // OR if we are inside the dating loop.

                    // Simple heuristic: If last Salva message has options starting with 'dating_', or 'reset' (indicating dating end flow)
                    // But 'reset' is vague.
                    // Let's check strictly for 'dating_' options.
                    const isDating = lastMsg.options?.some(o => o.action?.startsWith('dating_') || o.action === 'reset');

                    // Specific check: 'reset' also appears in Bad Ends? Yes.
                    // But we only want to show Toki-Memo during the dating event.
                    // If reset is present, it means we are at the END of dating or standard flow.
                    // If we want to revert to Normal Salva ONLY when completely reset to initial state?

                    // Better: Check if we are currently in a dating flow.
                    // Only switch if options suggest we are deeper in dating.
                    // Start: dating_start option is visible -> We are in NORMAL mode (user hasn't clicked yet).
                    // Next: dating_confess visible -> We are in DATING mode.

                    // Logic:
                    // If last message options contain 'dating_start' -> Normal Mode (Menu)
                    // If last message options contain 'dating_confess', 'dating_help', 'dating_energy', 'dating_biz' -> Dating Mode
                    // If last message options contain 'reset' (final result) -> Dating Mode (Result Screen)
                    // If reset was clicked -> We go back to INITIAL history -> Normal Mode

                    const menuVisible = lastMsg.options?.some(o => o.action === 'dating_start');

                    if (menuVisible) {
                        if (salva.texture !== salvaTexturesNew.normal) {
                            salva.texture = salvaTexturesNew.normal;
                            updateHitArea(false);
                            salva.scale.set(NORMAL_SCALE);
                        }
                    } else {
                        // Check if we are in dating steps
                        const isDatingStep = lastMsg.options?.some(o => o.action && o.action.startsWith('dating_') && o.action !== 'dating_start');
                        const isDatingResult = lastMsg.options?.some(o => o.action === 'reset' && !lastMsg.content.includes('いらっしゃいませ'));

                        if (isDatingStep || isDatingResult) {
                            if (salva.texture !== salvaTexturesNew.dating) {
                                salva.texture = salvaTexturesNew.dating;
                                updateHitArea(true);
                                // Set to larger dating scale
                                salva.scale.set(DATING_SCALE);
                            }
                        }
                    }
                });
            });

            let expressionIndex = 0;
            const expressions = ['normal', 'happy', 'surprised'] as const;

            salva.on('pointerdown', () => {
                // Disable expression switching during dating mode?
                if (salva.texture === salvaTexturesNew.dating) return;

                expressionIndex = (expressionIndex + 1) % expressions.length;
                const nextMood = expressions[expressionIndex];
                salva.texture = salvaTexturesNew[nextMood];
            });

            app.stage.addChild(salva);

            // [Before Deploy] COMMENT OUT THIS GUIDE LAYER
            // const guide = new Sprite(guideTexture);
            // guide.anchor.set(0.5);
            // guide.x = app.screen.width / 2;
            // guide.y = app.screen.height / 2;
            // guide.scale.set(scale); // Match BG scale
            // guide.alpha = 0.3; // Semi-transparent overlay
            // app.stage.addChild(guide);


            app.stage.addChild(salva);

            // --- Interactive Shelves Setup ---
            // Background is 16:9 (usually 1792x1024 generated). 
            // Anchor is 0.5, so coords are relative to center.
            // Estimation from image:
            // Top Shelf Y: ~ -20% of height (-200px if 1000px high)
            // Bottom Shelf Y: ~ -5% of height (-50px if 1000px high)
            // X spread: -40% to +40% width

            const shelfConfig = [];
            const cols = 10;
            // User correction #6:
            // - GapX: 50 (Narrower)
            // - BotRowY: -45 (Confirmed)
            const startX = -255;  // Kept same
            const gapX = 50;      // User specified 50
            const topRowY = -130; // Top coffee shelf
            const botRowY = -45;   // Bottom coffee shelf

            // Generate configs
            for (let i = 0; i < 20; i++) {
                const isTop = i < 10;
                const col = i % 10;
                shelfConfig.push({
                    id: i + 1,
                    x: startX + (col * gapX),
                    y: isTop ? topRowY : botRowY,
                    w: 40,   // Half size, square
                    h: 40    // Square
                });
            }

            const hitAreaContainer = new Sprite(); // Just a container
            background.addChild(hitAreaContainer); // Attached to background so it scales/moves WITH it

            // 棚スロットへの参照を保持（ハイライト用）
            const shelfHitAreas = new Map<number, Graphics>();

            shelfConfig.forEach(cfg => {
                const hit = new Graphics();

                // Actual Hit Area (Invisible but interactive)
                hit.rect(0, 0, cfg.w, cfg.h);
                hit.fill({ color: 0xffffff, alpha: 0.01 }); // Almost invisible but clickable

                hit.x = cfg.x;
                hit.y = cfg.y;
                hit.eventMode = 'static';
                hit.cursor = 'pointer';

                // Hover Effect
                hit.on('pointerover', () => {
                    hit.clear();
                    hit.rect(0, 0, cfg.w, cfg.h);
                    hit.fill({ color: 0xffff00, alpha: 0.3 }); // Highlight yellow
                    hit.stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
                });

                hit.on('pointerout', () => {
                    hit.clear();
                    hit.rect(0, 0, cfg.w, cfg.h);
                    hit.fill({ color: 0xffffff, alpha: 0.01 }); // Reset
                });

                // Click Action
                hit.on('pointerdown', () => {
                    console.log(`Clicked Product Shelf ID ${cfg.id}`);
                    import('../../features/store/gameStore').then(({ selectProduct, $allProducts }) => {
                        const products = $allProducts.get();
                        // Find product where ID in metadata matches shelf ID (or simple array index mapping)
                        // Our seed data has "metadata": {"id": 1, ...}
                        // But verifying metadata parsing might be tricky if string.
                        // Ideally we mapped them 1-20 in order.

                        // Try to find by integer ID first if DB `id` matches 1-20
                        const product = products.find(p => p.id === cfg.id) || products[cfg.id - 1]; // Fallback to index

                        if (product) {
                            selectProduct(product);
                        } else {
                            console.warn('Product not found for slot', cfg.id);
                        }
                    });
                });

                hitAreaContainer.addChild(hit);
                shelfHitAreas.set(cfg.id, hit);
            });

            // ハイライト商品の購読（点滅アニメーション）
            import('../../features/store/gameStore').then(({ $highlightedProductId }) => {
                let blinkInterval: ReturnType<typeof setInterval> | null = null;
                let currentHighlightId: number | null = null;

                $highlightedProductId.subscribe(productId => {
                    // 前のハイライトをクリア
                    if (blinkInterval) {
                        clearInterval(blinkInterval);
                        blinkInterval = null;
                    }
                    if (currentHighlightId !== null) {
                        const prevHit = shelfHitAreas.get(currentHighlightId);
                        if (prevHit) {
                            prevHit.clear();
                            prevHit.rect(0, 0, 40, 40);
                            prevHit.fill({ color: 0xffffff, alpha: 0.01 });
                        }
                    }

                    currentHighlightId = productId;

                    if (productId !== null) {
                        const hit = shelfHitAreas.get(productId);
                        if (hit) {
                            let visible = true;
                            // 点滅アニメーション（300msごとに切り替え）
                            blinkInterval = setInterval(() => {
                                hit.clear();
                                hit.rect(0, 0, 40, 40);
                                if (visible) {
                                    hit.fill({ color: 0xffff00, alpha: 0.5 });
                                    hit.stroke({ width: 3, color: 0xffffff, alpha: 1 });
                                } else {
                                    hit.fill({ color: 0xff8800, alpha: 0.3 });
                                    hit.stroke({ width: 2, color: 0xffff00, alpha: 0.6 });
                                }
                                visible = !visible;
                            }, 300);
                        }
                    }
                });
            });

            // Handle Resize
            const resize = () => {
                // Background logic
                background.x = app.screen.width / 2;
                background.y = app.screen.height / 2;

                const sX = app.screen.width / background.texture.width;
                const sY = app.screen.height / background.texture.height;
                const s = Math.max(sX, sY); // Cover
                background.scale.set(s);

                // Salva logic - keep at 65% from top to simulate standing behind counter
                salva.x = app.screen.width / 2;
                salva.y = app.screen.height * 0.65;
                // Keep scale relative to background or screen height
                // Further reduced to 0.35 based on feedback "too big"
                salva.scale.set(0.35 * (s / scale));

                // Guide logic
                // if (guide) {
                //    guide.x = app.screen.width / 2;
                //    guide.y = app.screen.height / 2;
                //    guide.scale.set(s);
                // }

                // Coffee logic (Dynamic)
                app.stage.children.forEach((child: any) => {
                    if (child.isProduct) {
                        child.x = app.screen.width * 0.7;
                        child.y = app.screen.height * 0.4; // Keep consistent interactive area
                        child.scale.set(0.3 * (app.screen.width / 1920));
                    }
                });
            };

            // Add simple resize listener (Pixi app with resizeTo handles canvas size, but we need to update sprites)
            // app.renderer.on('resize', resize) is nicer if supported, but window listener is generic
            window.addEventListener('resize', resize);

            if (onLoadComplete) onLoadComplete();

            // Cleanup for this effect
            return () => {
                window.removeEventListener('resize', resize);
            };
            // Cleanup function returned from initApp is not used directly by useEffect cleanup
            // because initApp is async. We handle cleanup in useEffect return.
        };

        void initApp();

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, [onLoadComplete]);

    return <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />;
};
