import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  FileText,
  Target,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Brain,
  Rocket
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CareerCraft AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Brain className="h-4 w-4" />
              Powered by GPT-4 AI Technology
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Your AI-Powered
              <span className="block text-blue-600">Career Intelligence Platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your job search with AI-driven resume optimization, intelligent job matching,
              and personalized career guidance. Land your dream role faster.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button size="xl" className="gap-2">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="xl" variant="outline">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
            <div className="relative rounded-2xl border-2 border-gray-200 shadow-2xl overflow-hidden bg-white">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Dashboard Preview"
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Intelligent Career Tools
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to accelerate your career journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'AI Resume Analysis',
                description: 'Get instant, detailed feedback on your resume with AI-powered suggestions for improvement and ATS optimization.'
              },
              {
                icon: Target,
                title: 'Smart Job Matching',
                description: 'Our AI analyzes your profile and matches you with jobs that fit your skills, experience, and career goals.'
              },
              {
                icon: Brain,
                title: 'Skills Gap Analysis',
                description: 'Identify missing skills and get personalized recommendations based on market demand and your target role.'
              },
              {
                icon: Zap,
                title: 'Auto-Apply',
                description: 'Apply to multiple jobs instantly with AI-generated cover letters tailored to each position.'
              },
              {
                icon: BarChart3,
                title: 'Interview Prep',
                description: 'Practice with AI-generated interview questions and get expert answers customized to your background.'
              },
              {
                icon: Rocket,
                title: 'Career Insights',
                description: 'Track your progress with detailed analytics and insights into your job search performance.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                description: 'Simply upload your current resume and let our AI analyze it for improvements.'
              },
              {
                step: '02',
                title: 'Get AI Insights',
                description: 'Receive detailed feedback, skill recommendations, and job matches tailored to your profile.'
              },
              {
                step: '03',
                title: 'Apply & Interview',
                description: 'Auto-apply to jobs with AI-generated cover letters and prepare with custom interview questions.'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-6xl font-bold text-blue-100 mb-4">{step.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of professionals accelerating their careers with AI
            </p>
            <Link to="/signup">
              <Button size="xl" variant="secondary" className="gap-2">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CareerCraft AI</span>
          </div>
          <p>2024 CareerCraft AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
