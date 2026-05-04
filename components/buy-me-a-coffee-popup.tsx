"use client";

import { useState, useEffect, useRef } from "react";
import { X, Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { motion, useAnimationControls } from "framer-motion";
import Link from "next/link";

// Animasyonlu kenarlar için özel stillerimiz
const animationStyles = `
  @keyframes borderAnimation {
    0% {
      background-position: 0% 0%, 100% 0%, 100% 100%, 0% 100%;
    }
    25% {
      background-position: 100% 0%, 100% 0%, 100% 100%, 0% 100%;
    }
    50% {
      background-position: 100% 0%, 100% 100%, 100% 100%, 0% 100%;
    }
    75% {
      background-position: 100% 0%, 100% 100%, 0% 100%, 0% 100%;
    }
    100% {
      background-position: 0% 0%, 100% 0%, 100% 100%, 0% 100%;
    }
  }

  .animated-border {
    position: relative;
    z-index: 1;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .animated-border::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    padding: 3px;
    border-radius: 0.5rem;
    background: linear-gradient(90deg, #fcd34d, #fbbf24, #f59e0b, #fcd34d) border-box;
    background-size: 300% 100%;
    background-position: 0% 0%;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: border-rotate 4s linear infinite;
  }

  @keyframes border-rotate {
    to {
      background-position: 300% 0%;
    }
  }
`;

interface BuyMeACoffeePopupProps {
  onClose: () => void;
  show: boolean;
}

export function BuyMeACoffeePopup({ onClose, show }: BuyMeACoffeePopupProps) {
  const [dontShowAgain, setDontShowAgain] = useLocalStorage("dontShowBuyMeACoffeePopup", false);
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const borderControls = useAnimationControls();
  // Effect for managing mounting, animation states, and unmounting
  useEffect(() => {
    let mountTimer: NodeJS.Timeout | undefined;
    let unmountTimer: NodeJS.Timeout | undefined;
    let closeButtonTimer: NodeJS.Timeout | undefined;

    // Only use 'show' prop to control visibility, not dontShowAgain 
    // (dontShowAgain will be checked by parent component before showing)
    const shouldAnimateIn = show;

    if (shouldAnimateIn) {
      setIsMounted(true); // Mount the component
      mountTimer = setTimeout(() => { // Short delay for CSS transitions to catch the mount
        setIsAnimatingIn(true); // Start "in" animation
        // Delay the close button appearance
        closeButtonTimer = setTimeout(() => {
          setShowCloseButton(true);
        }, 1500); // Delay for close button (e.g., 1.5 seconds after popup appears)
      }, 10); // Small delay, e.g., 10ms
    } else {
      // If conditions to show are not met, or if it was showing and now needs to hide
      if (isMounted) { // Only proceed if it was mounted
        setIsAnimatingIn(false); // Start "out" animation
        setShowCloseButton(false); // Hide close button immediately
        unmountTimer = setTimeout(() => {
          setIsMounted(false); // Unmount after animation duration
        }, 300); // Must match animation duration (e.g., duration-300 in CSS)
      }
    }

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(unmountTimer);
      clearTimeout(closeButtonTimer);
    };
  }, [show, dontShowAgain, isMounted]); // Updated dependencies

  // Border animasyonu için efekt
  useEffect(() => {
    if (isAnimatingIn) {
      borderControls.start({
        backgroundPosition: ["0% 0%", "300% 0%"],
        transition: {
          duration: 4,
          ease: "linear",
          repeat: Infinity,
        }
      });
    }
  }, [isAnimatingIn, borderControls]);

  const handleClose = () => {
    // Parent component will set `show` to false, triggering the useEffect to hide and unmount
    onClose();
  };

  const handleCheckboxChange = (checked: boolean) => {
    setDontShowAgain(checked);
  };
  
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />      
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isAnimatingIn ? "opacity-100" : "opacity-0"
        }`}
        style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
      >
        <motion.div
          className={`animated-border bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out ${
            isAnimatingIn ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          style={{ 
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.2), 0 8px 10px -6px rgba(245, 158, 11, 0.1)'
          }}
        >
          <div className="relative flex items-center mb-4 pb-2 border-b border-yellow-200/30">
            <h2 className="text-xl font-semibold flex items-center flex-1 pr-12">
              <Coffee className="h-6 w-6 mr-2 text-yellow-500" />
              <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">Bir Kahve Ismarlamaya Ne Dersiniz?</span>
            </h2>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-0 right-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Kapat</span>
              </Button>
            )}
          </div>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Merhaba! Bu uygulamayı geliştirmek ve yeni özellikler eklemek için büyük bir tutkuyla çalışıyorum. 
              Eğer uygulamayı faydalı buluyor ve gelişimine destek olmak isterseniz, bana bir kahve ısmarlayarak motivasyonuma katkıda bulunabilirsiniz.
            </p>
            <p>
              Her bir destek, uygulamanın daha da iyiye gitmesi için harcanan zaman ve emeğin bir takdiridir. Şimdiden teşekkürler!
            </p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 order-1 sm:order-none">
              <Switch
                id="dontShowAgainSwitch"
                checked={dontShowAgain}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="dontShowAgainSwitch" className="text-xs text-muted-foreground">
                Bir daha gösterme
              </Label>
            </div>           
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden group order-2 sm:order-none w-full sm:w-auto"
            >
              <Link
                href="https://buymeacoffee.com/soneryesilay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-md font-medium text-sm shadow-md group-hover:shadow-yellow-300/20"
              >
                <div className="relative flex items-center">
                  <motion.div
                    className="relative"
                    animate={{ 
                      rotate: [0, 10, -5, 0],
                      y: [0, -2, 1, 0]
                    }}
                    transition={{ 
                      duration: 1.8, 
                      repeat: Infinity, 
                      repeatDelay: 1,
                      ease: "easeInOut" 
                    }}
                  >
                    <Coffee className="h-5 w-5 mr-2.5" />
                  </motion.div>
                  <span className="font-bold tracking-wide">Destek Ol</span>
                  {/* Continuous floating hearts */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-200/70 pointer-events-none"
                      style={{
                        right: `${15 + (i * 8)}px`,
                        top: `${3 + (i * 2)}px`,
                        zIndex: 1
                      }}
                      animate={{ 
                        y: [-2, -20 - (i * 5)],
                        x: [0, (i % 2 === 0 ? 5 : -5) + (Math.sin(i) * 3)],
                        opacity: [0, 0.7, 0],
                        scale: [0.5, 0.7 + (i * 0.08), 0.3],
                        rotate: [0, i % 2 === 0 ? 20 : -20]
                      }}
                      transition={{ 
                        duration: 1.5 + (i * 0.3), 
                        repeat: Infinity, 
                        repeatDelay: 0.2 * i,
                        delay: i * 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <Heart size={i % 2 === 0 ? 10 : 12} />
                    </motion.div>
                  ))}
                </div>
              </Link>
              {/* Additional floating hearts outside the button */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`outer-heart-${i}`}
                  className="absolute text-yellow-400/40 z-10"
                  style={{
                    left: `${10 + (i * 20)}%`,
                    top: '50%'
                  }}
                  animate={{ 
                    y: [-5, -35 - (i * 15)],
                    x: [(i % 2 === 0 ? 5 : -5) * (i+1), (i % 2 === 0 ? 15 : -15) * (i+1)],
                    opacity: [0, 0.4, 0],
                    scale: [0.3, 0.6 + (i * 0.1), 0.2],
                    rotate: [0, i % 2 === 0 ? 45 : -45]
                  }}
                  transition={{ 
                    duration: 2.5 + (i * 0.5), 
                    repeat: Infinity,
                    repeatDelay: 0.1,
                    delay: i * 0.7,
                    ease: "easeOut"
                  }}
                >
                  <Heart size={i % 2 === 0 ? 14 : 16} fill={i % 3 === 0 ? "currentColor" : "none"} />
                </motion.div>
              ))}
              
              <motion.div 
                className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-300/20 to-yellow-400/20 blur-xl"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [0.8, 1, 0.8] 
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
              />
              <motion.div 
                className="absolute -inset-1 -z-20 bg-gradient-to-r from-yellow-400/10 via-yellow-300/5 to-yellow-400/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default BuyMeACoffeePopup;