import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { motion, AnimatePresence } from "framer-motion";

interface Counter {
  id: string;
  title: string;
  description: string;
  count: number;
  target?: number;
}

// Define constants for character limits
const MAX_TITLE_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 50;
const MAX_TARGET_VALUE = 9999;

export default function CounterManagement() {
  const { toast } = useToast();
  const [counters, setCounters] = useLocalStorage<Counter[]>("counters", []);
  const [newCounter, setNewCounter] = useState<Omit<Counter, "id" | "count">>({
    title: "",
    description: "",
    target: undefined
  });
  
  // Animation variants for container and cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };
  const addCounter = () => {
    // Validate title is provided
    if (!newCounter.title.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen sayaç için bir başlık girin.",
        variant: "destructive"
      });
      return;
    }

    // Validate title length
    if (newCounter.title.trim().length > MAX_TITLE_LENGTH) {
      toast({
        title: "Hata",
        description: `Başlık ${MAX_TITLE_LENGTH} karakterden fazla olamaz.`,
        variant: "destructive"
      });
      return;
    }
    
    // Validate description length
    if (newCounter.description && newCounter.description.length > MAX_DESCRIPTION_LENGTH) {
      toast({
        title: "Hata",
        description: `Açıklama ${MAX_DESCRIPTION_LENGTH} karakterden fazla olamaz.`,
        variant: "destructive"
      });
      return;
    }

    // Validate target is positive if provided
    if (newCounter.target !== undefined && newCounter.target <= 0) {
      toast({
        title: "Hata",
        description: "Hedef değeri sıfırdan büyük olmalıdır.",
        variant: "destructive"
      });
      return;
    }

    // Validate target maximum value
    if (newCounter.target !== undefined && newCounter.target > MAX_TARGET_VALUE) {
      toast({
        title: "Hata",
        description: `Hedef değeri en fazla ${MAX_TARGET_VALUE} olabilir.`,
        variant: "destructive"
      });
      return;
    }

    const counter: Counter = {
      id: Date.now().toString(),
      title: newCounter.title.trim(),
      description: newCounter.description.trim(),
      count: 0,
      target: newCounter.target
    };

    setCounters([...counters, counter]);
    setNewCounter({ title: "", description: "", target: undefined });
    toast({
      title: "Sayaç eklendi",
      description: `"${counter.title}" sayacı başarıyla eklendi.`
    });
  };
  const incrementCounter = (id: string) => {
    setCounters(counters.map(counter => {
      if (counter.id === id) {
        return { ...counter, count: counter.count + 1 };
      }
      return counter;
    }));
    // Haptic feedback if available
    if (window.navigator && 'vibrate' in window.navigator) {
      try {
        window.navigator.vibrate(50); // vibrate for 50ms for subtle feedback
      } catch (e) {
        // Ignore errors - vibration might not be supported
      }
    }
  };

  const decrementCounter = (id: string) => {
    setCounters(counters.map(counter => {
      if (counter.id === id && counter.count > 0) {
        return { ...counter, count: counter.count - 1 };
      }
      return counter;
    }));
    // Haptic feedback if available
    if (window.navigator && 'vibrate' in window.navigator) {
      try {
        window.navigator.vibrate(50); // vibrate for 50ms for subtle feedback
      } catch (e) {
        // Ignore errors - vibration might not be supported
      }
    }
  };

  const deleteCounter = (id: string) => {
    const counterToDelete = counters.find(counter => counter.id === id);
    setCounters(counters.filter(counter => counter.id !== id));
    toast({
      title: "Sayaç silindi",
      description: `"${counterToDelete?.title}" sayacı başarıyla silindi.`
    });
  };

  const resetCounter = (id: string) => {
    setCounters(counters.map(counter => {
      if (counter.id === id) {
        return { ...counter, count: 0 };
      }
      return counter;
    }));
    toast({
      title: "Sayaç sıfırlandı",
      description: "Sayaç başarıyla sıfırlandı."
    });
  };
  return (
    <motion.div 
      className="container mx-auto p-4 space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span className="inline-block p-1 rounded-md bg-primary/10">
            <PlusCircle className="h-5 w-5 text-primary" />
          </span>
          Sayaçlar
        </h1>
      </motion.div>
      
      <motion.div variants={cardVariants}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Yeni Sayaç Ekle</CardTitle>
            <CardDescription>Saymak istediğiniz şey için bir sayaç oluşturun</CardDescription>
          </CardHeader>
        <CardContent>
          <div className="grid gap-4">            <div className="grid gap-2">
              <Label htmlFor="title">Başlık (Max {MAX_TITLE_LENGTH} karakter)</Label>
              <Input
                id="title"
                placeholder="Sayaç başlığı"
                value={newCounter.title}
                maxLength={MAX_TITLE_LENGTH}
                onChange={(e) => setNewCounter({ ...newCounter, title: e.target.value })}
              />
              <div className="text-xs text-right text-muted-foreground">
                {newCounter.title.length}/{MAX_TITLE_LENGTH}
              </div>
            </div>            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Max {MAX_DESCRIPTION_LENGTH} karakter)</Label>
              <Input
                id="description"
                placeholder="Ne için sayıyorsunuz?"
                value={newCounter.description}
                maxLength={MAX_DESCRIPTION_LENGTH}
                onChange={(e) => setNewCounter({ ...newCounter, description: e.target.value })}
              />
              <div className="text-xs text-right text-muted-foreground">
                {newCounter.description.length}/{MAX_DESCRIPTION_LENGTH}
              </div>
            </div>            <div className="grid gap-2">
              <Label htmlFor="target">Hedef (İsteğe bağlı)</Label>
              <Input
                id="target"
                type="number"
                min="1"
                placeholder="Hedef sayı"
                value={newCounter.target || ""}
                onChange={(e) => {
                  // If input contains a minus sign, remove it
                  if (e.target.value.includes('-')) {
                    e.target.value = e.target.value.replace(/-/g, '');
                  }
                  
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  
                  // Only allow positive values and values within max limit
                  if (value === undefined || (value > 0 && value <= MAX_TARGET_VALUE)) {
                    setNewCounter({ ...newCounter, target: value });
                  } else if (value !== undefined && value > MAX_TARGET_VALUE) {
                    // Kullanıcıya anında geri bildirim vermek için state'i güncelle ama toast ile uyar
                    setNewCounter({ ...newCounter, target: MAX_TARGET_VALUE }); 
                    toast({
                        title: "Uyarı",
                        description: `Hedef en fazla ${MAX_TARGET_VALUE} olabilir. Değer otomatik olarak ${MAX_TARGET_VALUE} olarak ayarlandı.`,
                        variant: "default"
                    });
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent typing the minus sign
                  if (e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
        </CardContent>        <CardFooter>
          <Button onClick={addCounter}>Sayaç Ekle</Button>
        </CardFooter>
      </Card>
      </motion.div>      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {counters.map((counter, index) => (
            <motion.div 
              key={counter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: index * 0.1,
                  duration: 0.4 
                }
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
            >
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{counter.title}</CardTitle>
                      <CardDescription>{counter.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCounter(counter.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-center">
                    <motion.div 
                      className="text-4xl font-bold mb-2"
                      key={counter.count}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      {counter.count}
                    </motion.div>
                    {counter.target && (
                      <div className="text-sm text-muted-foreground">
                        Hedef: {counter.count}/{counter.target} 
                        ({Math.round((counter.count / counter.target) * 100)}%)
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline"
                      onClick={() => decrementCounter(counter.id)}
                      disabled={counter.count <= 0}
                    >
                      -
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline"
                      onClick={() => resetCounter(counter.id)}
                    >
                      Sıfırla
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="default"
                      onClick={() => incrementCounter(counter.id)}
                    >
                      +
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {counters.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-8 text-muted-foreground"
        >
          Henüz sayaç eklenmemiş. Yukarıdaki formu kullanarak sayaç ekleyebilirsiniz.
        </motion.div>
      )}
    </motion.div>
  );
}
