import { CuboidIcon as Cube } from "lucide-react"

interface LogoProps {
  className?: string
}

export default function Logo({ className = "w-6 h-6" }: LogoProps) {
  return (
    <div className={`relative ${className}`}>
      <Cube className="text-blue-500 w-full h-full" />
    </div>
  )
}
