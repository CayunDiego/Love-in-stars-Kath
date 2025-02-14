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

class TextStar {
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  twinkleSpeed: number
  brightness: number
  maxBrightness: number
  visible: boolean
  delay: number

  constructor(x: number, y: number, delay: number) {
    this.targetX = x
    this.targetY = y
    this.x = x + (Math.random() - 0.5) * 50
    this.y = y + (Math.random() - 0.5) * 50
    this.size = Math.random() * 1.5 + 1.5
    this.twinkleSpeed = Math.random() * 0.08 + 0.04
    this.brightness = 0.3
    this.maxBrightness = 0.8
    this.visible = false
    this.delay = delay
  }

  update() {
    if (!this.visible) return

    this.x += (this.targetX - this.x) * 0.1
    this.y += (this.targetY - this.y) * 0.1

    this.brightness += this.twinkleSpeed
    if (this.brightness > this.maxBrightness || this.brightness < 0.2) {
      this.twinkleSpeed = -this.twinkleSpeed
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return

    ctx.shadowBlur = 15
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)"

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`
    ctx.fill()

    ctx.shadowBlur = 8
    ctx.shadowColor = "rgba(255, 255, 255, 0.4)"
    ctx.fill()

    ctx.shadowBlur = 3
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)"
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

function getTextPoints(text: string, ctx: CanvasRenderingContext2D, x: number, y: number): Array<[number, number]> {
  ctx.font = "bold 72px Arial"
  ctx.fillStyle = "white"

  const metrics = ctx.measureText(text)
  const textX = x - metrics.width / 2

  ctx.fillText(text, textX, y)

  const points: Array<[number, number]> = []
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const pixels = imageData.data
  const density = 6

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (let i = 0; i < imageData.height; i += density) {
    for (let j = 0; j < imageData.width; j += density) {
      const alpha = pixels[(i * imageData.width + j) * 4 + 3]
      if (alpha > 0) {
        points.push([j, i])
      }
    }
  }

  return points
}

export default function StarrySky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textStarsRef = useRef<TextStar[]>([])
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

    const points = getTextPoints(fullMessage, ctx, canvas.width / 2, canvas.height / 2)

    textStarsRef.current = points.map((point, index) => new TextStar(point[0], point[1], index * 5))

    const stars: Star[] = []
    const numberOfStars = Math.floor((canvas.width * canvas.height) / 1000)

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

    const southernCross = [
      new Star(canvas.width * 0.25, canvas.height * 0.35, 3, true),
      new Star(canvas.width * 0.19, canvas.height * 0.15, 2.5, true),
      new Star(canvas.width * 0.15, canvas.height * 0.26, 2.5, true),
      new Star(canvas.width * 0.29, canvas.height * 0.2, 2.5, true),
    ]

    // Create Three Marys constellation
    const threeMarys = [
      new Star(canvas.width * 0.7, canvas.height * 0.25, 3, true), // Cambiado de 0.4 a 0.25
      new Star(canvas.width * 0.72, canvas.height * 0.27, 3, true), // Cambiado de 0.42 a 0.27
      new Star(canvas.width * 0.74, canvas.height * 0.29, 3, true), // Cambiado de 0.44 a 0.29
    ]

    const shootingStars: ShootingStar[] = Array(3)
      .fill(null)
      .map(() => new ShootingStar(canvas.width, canvas.height))

    let frameCount = 0
    const startTime = Date.now()

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 15, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const currentTime = Date.now()
      const elapsed = currentTime - startTime

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

      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 1

      ctx.moveTo(southernCross[0].x, southernCross[0].y)
      ctx.lineTo(southernCross[1].x, southernCross[1].y)
      ctx.moveTo(southernCross[2].x, southernCross[2].y)
      ctx.lineTo(southernCross[3].x, southernCross[3].y)
      ctx.stroke()

      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 1
      ctx.moveTo(threeMarys[0].x, threeMarys[0].y)
      threeMarys.forEach((star) => {
        ctx.lineTo(star.x, star.y)
      })
      ctx.stroke()

      textStarsRef.current.forEach((star, index) => {
        if (elapsed > star.delay) {
          star.visible = true
          star.update()
          star.draw(ctx)
        }
      })

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
    </div>
  )
}

