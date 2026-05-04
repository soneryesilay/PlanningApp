"use client"

import { Moon, Sun, Flower, Waves, Bug } from "lucide-react" // Droplet Waves ile değiştirildi
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion" // Framer motion import'u eklendi

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <motion.div 
      className="flex items-center space-x-2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-sm font-medium text-muted-foreground">
        Temalar
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div 
            whileTap={{ scale: 0.9 }} 
            transition={{ duration: 0.3 }}
          >
            <Button variant="outline" size="icon" className="overflow-hidden">
              <div className="relative h-[1.2rem] w-[1.2rem]">
                {/* Tüm ikonları motion.div ile sarmalıyoruz ve animasyon ekliyoruz */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    opacity: theme !== 'dark' && theme !== 'pink' && theme !== 'blue' && theme !== 'yellow' ? 1 : 0,
                    rotate: theme !== 'dark' && theme !== 'pink' && theme !== 'blue' && theme !== 'yellow' ? 0 : -90,
                    scale: theme !== 'dark' && theme !== 'pink' && theme !== 'blue' && theme !== 'yellow' ? 1 : 0.5
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                </motion.div>

                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    opacity: theme === 'dark' ? 1 : 0,
                    rotate: theme === 'dark' ? 0 : 90,
                    scale: theme === 'dark' ? 1 : 0.5
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                </motion.div>

                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    opacity: theme === 'pink' ? 1 : 0,
                    rotate: theme === 'pink' ? 0 : 90,
                    scale: theme === 'pink' ? 1 : 0.5
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Flower className="h-[1.2rem] w-[1.2rem]" />
                </motion.div>

                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    opacity: theme === 'blue' ? 1 : 0,
                    rotate: theme === 'blue' ? 0 : 90,
                    scale: theme === 'blue' ? 1 : 0.5
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Waves className="h-[1.2rem] w-[1.2rem]" />
                </motion.div>

                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    opacity: theme === 'yellow' ? 1 : 0,
                    rotate: theme === 'yellow' ? 0 : 90,
                    scale: theme === 'yellow' ? 1 : 0.5
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Bug className="h-[1.2rem] w-[1.2rem]" />
                </motion.div>
              </div>
              <span className="sr-only">Tema değiştir</span>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.05, delayChildren: 0.05 }}
          >
            <ThemeMenuItem theme="light" currentTheme={theme} onClick={() => setTheme("light")}>Açık</ThemeMenuItem>
            <ThemeMenuItem theme="dark" currentTheme={theme} onClick={() => setTheme("dark")}>Koyu</ThemeMenuItem>
            <ThemeMenuItem theme="pink" currentTheme={theme} onClick={() => setTheme("pink")}>Pembe</ThemeMenuItem>
            <ThemeMenuItem theme="blue" currentTheme={theme} onClick={() => setTheme("blue")}>Mavi</ThemeMenuItem>
            <ThemeMenuItem theme="yellow" currentTheme={theme} onClick={() => setTheme("yellow")}>Sarı</ThemeMenuItem>
            <ThemeMenuItem theme="system" currentTheme={theme} onClick={() => setTheme("system")}>Sistem</ThemeMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

// Özel tema menü öğesi bileşeni
interface ThemeMenuItemProps {
  theme: string;
  currentTheme: string | undefined;
  onClick: () => void;
  children: React.ReactNode;
}

const ThemeMenuItem = ({ theme, currentTheme, onClick, children }: ThemeMenuItemProps) => {
  const isActive = theme === currentTheme;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: "var(--accent)", x: 2 }}
      transition={{ duration: 0.2 }}
    >
      <DropdownMenuItem 
        onClick={onClick} 
        className={`flex items-center gap-2 ${isActive ? 'bg-muted' : ''}`}
      >
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-2 w-2 rounded-full bg-primary"
          />
        )}
        {children}
      </DropdownMenuItem>
    </motion.div>
  );
};
