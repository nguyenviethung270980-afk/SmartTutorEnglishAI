import { Header } from "@/components/Header";
import { CreateHomeworkForm } from "@/components/CreateHomeworkForm";
import { HomeworkList } from "@/components/HomeworkList";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Hero & List */}
          <div className="lg:col-span-7 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
                Master English with <br />
                <span className="text-gradient">Personalized AI</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Generate unlimited practice exercises tailored exactly to your level and interests. Learning English has never been this smart.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display">Recent Exercises</h2>
              </div>
              <HomeworkList />
            </motion.div>
          </div>

          {/* Right Column: Sticky Form */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="sticky top-24"
            >
              <CreateHomeworkForm />
              
              {/* Decorative elements behind the card */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
