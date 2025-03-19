import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrainCog, Lightbulb, Rocket } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Transform Your Ideas with AI-Powered Innovation
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Generate breakthrough ideas using advanced AI and proven innovation heuristics. 
            Perfect for entrepreneurs, product managers, and innovators.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="container space-y-6 py-8 dark:bg-transparent md:py-12 lg:py-24">
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Lightbulb className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">AI-Powered Ideation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate innovative ideas using advanced AI technology and proven design principles.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <BrainCog className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Innovation Heuristics</h3>
                <p className="text-sm text-muted-foreground">
                  Apply systematic thinking patterns to unlock creative solutions.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Rocket className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="font-bold">Idea Management</h3>
                <p className="text-sm text-muted-foreground">
                  Organize, rate, and iterate on your ideas in a structured workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}