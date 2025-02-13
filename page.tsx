"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

class Star {
  x: number
  y: number
  size: number
  twinkleSpeed: number
  brightness: number
  maxBrightness: number
  isConstellation: boolean

  constructor(x: number, y: number, size: number, isConstellation = false) {
    this.x = x
    this.y = y
    this.size = size
    this.twinkleSpeed = Math.random() * 0.05 + 0.02
    this.brightness = isConstellation ? 0.8 : Math.random() * 0.5 + 0.3
    this.maxBrightness = isConstellation ? 1 : 0.9
    this.isConstellation = isConstellation
  }

  update() {
    this.brightness += this.twinkleSpeed
    if (this.brightness > this.maxBrightness || this.brightness < (this.isConstellation ? 0.6 : 0.3)) {
      this.twinkleSpeed = -this.twinkleSpeed
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isConstellation) {
      ctx.shadowBlur = 10
      ctx.shadowColor = "rgba(255, 255, 255, 0.7)"
    }

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`
    ctx.fill()

    ctx.shadowBlur = 0
  }
}

class ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  active: boolean

  constructor(width: number, height: number) {
    this.reset(width, height)
  }

  reset(width: number, height: number) {
    this.x = Math.random() * width
    this.y = Math.random() * (height / 3)
    this.length = Math.random() * 80 + 50
    this.speed = Math.random() * 15 + 10
    this.angle = Math.PI / 4
    this.active = true
  }

  update(width: number, height: number) {
    this.x += Math.cos(this.angle) * this.speed
    this.y += Math.sin(this.angle) * this.speed

    if (this.x > width || this.y > height) {
      this.active = false
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    const tailX = this.x - Math.cos(this.angle) * this.length
    const tailY = this.y - Math.sin(this.angle) * this.length

    const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY)
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)")
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

    ctx.strokeStyle = gradient
    ctx.lineTo(tailX, tailY)
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

export default function StarrySky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [message, setMessage] = useState("")
  const [showMessage, setShowMessage] = useState(false)
  const fullMessage = "Kath te amo"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener("resize", updateSize)

    // Aumentar significativamente la densidad de estrellas
    const stars: Star[] = []
    const numberOfStars = Math.floor((canvas.width * canvas.height) / 1000)

    // Crear una cuadrícula para distribuir las estrellas más uniformemente
    const gridSize = 50
    const cols = Math.ceil(canvas.width / gridSize)
    const rows = Math.ceil(canvas.height / gridSize)

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const starsPerCell = Math.floor(Math.random() * 3) + 1
        for (let k = 0; k < starsPerCell; k++) {
          const x = j * gridSize + Math.random() * gridSize
          const y = i * gridSize + Math.random() * gridSize
          const size = Math.random() * 1.5 + 0.5
          stars.push(new Star(x, y, size))
        }
      }
    }

    // Create Southern Cross constellation (Crux)
    const southernCross = [
      // Acrux (α Crucis) - La más brillante en la base
      new Star(canvas.width * 0.38, canvas.height * 0.45, 3, true),
      // Gacrux (γ Crucis) - En la parte superior
      new Star(canvas.width * 0.32, canvas.height * 0.25, 2.5, true),
      // Becrux/Mimosa (β Crucis) - Brazo izquierdo
      new Star(canvas.width * 0.28, canvas.height * 0.36, 2.5, true),
      // δ Crucis - Brazo derecho
      new Star(canvas.width * 0.42, canvas.height * 0.30, 2.5, true),
    ]

    // Create Three Marys constellation
    const threeMarys = [
      new Star(canvas.width * 0.7, canvas.height * 0.4, 3, true),
      new Star(canvas.width * 0.72, canvas.height * 0.42, 3, true),
      new Star(canvas.width * 0.74, canvas.height * 0.44, 3, true),
    ]

    const shootingStars: ShootingStar[] = Array(3)
      .fill(null)
      .map(() => new ShootingStar(canvas.width, canvas.height))

    let frameCount = 0
    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 15, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        star.update()
        star.draw(ctx)
      })

      southernCross.forEach((star) => {
        star.update()
        star.draw(ctx)
      })
      threeMarys.forEach((star) => {
        star.update()
        star.draw(ctx)
      })

      // Dibujar las líneas con el mismo estilo para ambas constelaciones
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 1

      // Cruz del Sur
      ctx.moveTo(southernCross[0].x, southernCross[0].y)
      ctx.lineTo(southernCross[1].x, southernCross[1].y)
      ctx.moveTo(southernCross[2].x, southernCross[2].y)
      ctx.lineTo(southernCross[3].x, southernCross[3].y)
      ctx.stroke()

      // Tres Marías
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 1
      ctx.moveTo(threeMarys[0].x, threeMarys[0].y)
      threeMarys.forEach((star) => {
        ctx.lineTo(star.x, star.y)
      })
      ctx.stroke()

      frameCount++
      if (frameCount % 120 === 0) {
        const inactiveStar = shootingStars.find((star) => !star.active)
        if (inactiveStar) {
          inactiveStar.reset(canvas.width, canvas.height)
        }
      }

      shootingStars.forEach((star) => {
        if (star.active) {
          star.update(canvas.width, canvas.height)
          star.draw(ctx)
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    setTimeout(() => {
      setShowMessage(true)
      let currentLength = 0
      const interval = setInterval(() => {
        if (currentLength <= fullMessage.length) {
          setMessage(fullMessage.slice(0, currentLength))
          currentLength++
        } else {
          clearInterval(interval)
        }
      }, 200)
    }, 2000)

    return () => {
      window.removeEventListener("resize", updateSize)
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/starry-sky-4736004_1280%20(1).jpg-8QFDZ2djycvPlCnzB4ZYHXu09MjivM.jpeg"
        alt="Starry night sky"
        fill
        className="object-cover"
        priority
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-80" />
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider opacity-40 animate-twinkle-shadow">{message}</h1>
        </div>
      )}
    </div>
  )
}

