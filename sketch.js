// Published on Github under the MIT license
// You may copy, edit or publish the following code as long as you are crediting the owner

const ALIVE = 0
const INFECTED = 1
const DEAD = 2
const VACCINATED = 3
const HEALED = 4

const RED = '#CD113B'
const BLUE = '#3EDBF0'
const BLACK = '#2d3436'
const WHITE = '#dfe6e9'
const ORANGE = '#FF7600'
const GREEN = '#28FFBF'
const GREY = '#476072'
const LIGHTGREEN = '#A7FF83'
const PINK = '#EFB7B7'

class Population {
    constructor(size, countX, countY, vaccineRate) {
        this.countX = countX
        this.countY = countY
        this.size = size
        this.totalPop = countX * countY
        this.population = []
        // Creating population
        for(let i = 0; i < this.countX; i++) {
            this.population[i] = []
            for(let j = 0; j < this.countY; j++) {
                let p = new Person(size / 2 + i * size, size/2 + j * size, size - 0.25 * size)
                if(Math.random() >= 1 - vaccineRate)
                    p.vaccinate()
                p.draw()
                this.population[i].push(p)
            }
        }
        // Defining neighborhood
        for(let i = 0; i < this.countX; i++) {
            for(let j = 0; j < this.countY; j++) {
                let available = []
                if(i > 0) available.push(this.population[i - 1][j])
                if(i < this.countX - 1) available.push(this.population[i + 1][j])
                if(j > 0) available.push(this.population[i][j - 1])
                if(j < this.countY - 1) available.push(this.population[i][j + 1])
                this.population[i][j].setNeighborhood(available)
            }
        } 
    }

    draw() {
        let infected = 0
        let deathCount = 0
        for(let i = 0; i < this.countX; i++) {
            for(let j = 0; j < this.countY; j++) {
                this.population[i][j].draw()
                if(this.population[i][j].status == DEAD)
                deathCount++
                if(this.population[i][j].status == INFECTED)
                infected++
            }
        }
        if(infected == 0) dayCounting = false
        textSize(25)
        fill(ORANGE)
        let textPlay
        if(infected > 0)
            textPlay = "▶️ Infection running !"
        else textPlay = '▶️ Click on a circle to \n start the infection !'
        text(textPlay, 20, this.countY * this.size + 30)
        fill(WHITE)
        textSize(20)
        text("👶 Population : " + this.totalPop, 20, this.countY * this.size + 100)
        text("⏰ Days elapsed : " + dayCount, 300, this.countY * this.size + 30)
        text("☠️ Death count : " + deathCount, 300, this.countY * this.size + 60)
        text("🤢 Infection count : " + infectedCount, 300, this.countY * this.size + 90)
        text("😀 Healing count : " + infectedCount, 300, this.countY * this.size + 120)
    }

    checkColors() {
        for(let i = 0; i < this.countX; i++) {
            for(let j = 0; j < this.countY; j++) {
                this.population[i][j].clicked()
            }
        }
    }

}

class Person {
    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
        this.status = ALIVE
        this.prevStatus = this.status
        this.animationRunning = false
        this.animationFrames = 5
        this.animationCountdown = 0
        this.willDie = false
        this.wasInfected = false
        this.setPropagationRate()
    }

    setNeighborhood(neighbors) {
        this.neighbors = neighbors
    }

    draw() {
        this.checkLifespan()
        this.propagate()
        
        let c
        switch(this.status) {
            case ALIVE:
                c = color(GREY)
                break
            case INFECTED:
                c = color(ORANGE)
                break
            case DEAD:
                c = color(RED)
                break
            case VACCINATED:
                c = color(BLUE)
                break
            case HEALED:
                c = color(LIGHTGREEN)
                break
            default:
                c = color(BLACK)     
        }

        fill(c)

        if(this.status !== this.prevStatus) {
            this.setPropagationRate()
            this.prevStatus = this.status
            if(animationEnabled) {
                this.animationRunning = true
                this.animationCountdown = 0
            }
        }
        let newSize
        if(this.animationRunning) {
            newSize = this.size * this.animationCountdown / this.animationFrames
            if(this.animationCountdown >= this.animationFrames) {
                this.animationCountdown = this.animationFrames - 1
                this.animationRunning = false
            }
            this.animationCountdown++
        } else {
            newSize = this.size
        }

        circle(this.x, this.y, newSize)
    }

    setPropagationRate() {
        let max = 2 * (1 / propSpeed)
        let min = 0.5 * (1 / propSpeed)
        this.countdown = Math.floor(Math.random() * (max - min) + min);
    }

    propagate() {
        if(this.status == INFECTED) {
            if(this.countdown <= 0) {
                let selected = this.neighbors[Math.floor(Math.random() * this.neighbors.length)]
                if(selected.status === VACCINATED || selected.status === HEALED) {
                    if(Math.random() >= vaccineEfficiency) {
                        selected.infect()
                        selected.wasInfected = true
                    }   
                }
                else selected.infect()
                this.setPropagationRate()
            }
            else this.countdown--
        }
    }

    checkLifespan() {
        if(this.wasInfected) this.deathRate = vaccinatedDeathRate
        else this.deathRate = deathRate

        if(this.status !== INFECTED) return
            if(this.lifespan <= 0) {
                if(this.willDie) this.kill()
                else this.heal()
                return
            }
        this.lifespan--
    }

    clicked() {
        if(dist(mouseX, mouseY, this.x, this.y) < this.size / 2) {
            this.infect()
            dayCounting = true
        }
    }

    infect() {
        if(this.status !== DEAD) {
            this.status = INFECTED
            infectedCount++
            this.willDie = Math.random() < this.deathRate
            let max = 2 * (this.willDie ? deathTime : healTime)
            let min = 0.5 * (this.willDie ? deathTime : healTime)
            this.lifespan = Math.floor(Math.random() * (max - min) + min);
        }
    }

    vaccinate() {
        if(this.status !== DEAD) {
            this.status = VACCINATED
        }
    }

    heal() {
        if(this.status === INFECTED) {
            this.status = HEALED
        }
    }

    kill() {
        if(this.status !== DEAD) {
            this.status = DEAD
        }
    }

}

let size = 20
let xPeople = 60
let yPeople = 30

let FPS = 20

// Dynamic
let propSpeed = 0.3
let deathTime = 20
let healTime = 12
let vaccineEfficiency = 0.5
let deathRate = 0.5
let vaccinatedDeathRate = 0.05

// Static
let vaccineRate = 0.4

let infectedCount = 0
let healedCount = 0
let dayCount = 0
let dayCounting = false
let population = null

// Buttons
let resetButton
let animationButton
let pauseButton
let animationEnabled = true
let paused = false

// Sliders
let sliderPorpSpeed
let sliderVaccineEfficiency
let sliderVaccineDeathRate
let sliderDeathTime
let sliderHealTime
let sliderVaccineRate
let sliderFrameRate

let firstSliderPos = 85

let githubLink

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(FPS)
    reset()

    noStroke()

    resetButton = new Clickable()
    resetButton.color = PINK
    resetButton.text = "Reset"
    resetButton.resize(150, 70)
    resetButton.textSize = 20    
    resetButton.onPress = function() {
        reset()
    }

    pauseButton = new Clickable()
    pauseButton.resize(150, 70)
    pauseButton.textSize = 20    

    animationButton = new Clickable()
    animationButton.resize(220, 70)
    animationButton.textSize = 18   
    animationButton.onPress = function() {
        animationEnabled = !animationEnabled
    }

    sliderFrameRate = createSlider(3, 50, 20)
    sliderFrameRate.style('width', '300px')
    sliderFrameRate.input(changeFramerate)

    sliderPorpSpeed = createSlider(0, 100, 30)
    sliderPorpSpeed.style('width', '200px')

    sliderDeathRate = createSlider(0, 100, 15)
    sliderDeathRate.style('width', '200px')

    sliderVaccineEfficiency = createSlider(0, 100, 50)
    sliderVaccineEfficiency.style('width', '200px')

    sliderVaccineDeathRate = createSlider(0, 100, 5)
    sliderVaccineDeathRate.style('width', '200px')

    sliderDeathTime = createSlider(0, 50, 15)
    sliderDeathTime.style('width', '200px')

    sliderHealTime = createSlider(0, 50, 10)
    sliderHealTime.style('width', '200px')

    sliderVaccineRate = createSlider(0, 100, 20)
    sliderVaccineRate.style('width', '200px')
    sliderVaccineRate.input(reset)

    githubLink = createA('https://github.com/bastoo0/Virus-Simulation', 'Source code / Help');
    githubLink.style('color', 'white')
    githubLink.style('font-size', '22px')
    githubLink.style('text-align', 'center')

}

function changeFramerate(){
    frameRate(sliderFrameRate.value())
}

function windowResized() {
    reset()
    resizeCanvas(windowWidth, windowHeight);
  }

function draw() {
    propSpeed = sliderPorpSpeed.value() / 100
    deathRate = sliderDeathRate.value() / 100
    vaccineEfficiency = sliderVaccineEfficiency.value() / 100
    vaccinatedDeathRate = sliderVaccineDeathRate.value() / 100
    deathTime = sliderDeathTime.value()
    healTime = sliderHealTime.value()
    vaccineRate = sliderVaccineRate.value() / 100

    background(BLACK);

    resetButton.locate(windowWidth - 320, windowHeight - 100)
    pauseButton.locate(windowWidth - 160, windowHeight - 100)
    animationButton.locate(windowWidth - 550, windowHeight - 100)

    sliderPorpSpeed.position(windowWidth - 230, firstSliderPos + 70 * 0)
    sliderDeathRate.position(windowWidth - 230, firstSliderPos + 70 * 1)
    sliderVaccineEfficiency.position(windowWidth - 230, firstSliderPos + 70 * 2)
    sliderVaccineDeathRate.position(windowWidth - 230, firstSliderPos + 70 * 3)
    sliderDeathTime.position(windowWidth - 230, firstSliderPos + 70 * 4)
    sliderHealTime.position(windowWidth - 230, firstSliderPos + 70 * 5)
    sliderVaccineRate.position(windowWidth - 230, firstSliderPos + 70 * 7) 
    sliderFrameRate.position(animationButton.x + 60, animationButton.y - 40)

    textSize(20)
    text('📈 Dynamic parameters', windowWidth - 250, 30)


    textSize(15)
    text('Avg. spreading speed', sliderPorpSpeed.x, sliderPorpSpeed.y - 24)
    text(sliderPorpSpeed.value() +"%", sliderPorpSpeed.x - 40, sliderPorpSpeed.y + 15)
    
    text('Virus death rate (%)', sliderDeathRate.x, sliderDeathRate.y - 24)
    text(sliderDeathRate.value()+"%", sliderDeathRate.x - 40, sliderDeathRate.y + 15)

    text('Vaccine protection rate (%)', sliderVaccineEfficiency.x, sliderVaccineEfficiency.y - 24)
    text(sliderVaccineEfficiency.value()+"%", sliderVaccineEfficiency.x - 40, sliderVaccineEfficiency.y + 15)

    text('Vaccinated death rate (%)', sliderVaccineDeathRate.x, sliderVaccineDeathRate.y - 24)
    text(sliderVaccineDeathRate.value()+"%", sliderVaccineDeathRate.x - 40, sliderVaccineDeathRate.y + 15)

    text('Days before death (avg.)', sliderDeathTime.x, sliderDeathTime.y - 10)
    text(sliderDeathTime.value(), sliderDeathTime.x - 40, sliderDeathTime.y + 15)

    text('Days before healing (avg.)', sliderHealTime.x, sliderHealTime.y - 10)
    text(sliderHealTime.value(), sliderHealTime.x - 40, sliderHealTime.y + 15)

    textSize(12)
    text('(100% = 1 transm. per day per infected)', sliderPorpSpeed.x, sliderPorpSpeed.y - 7)
    text('Prob. of death when infected without vax', sliderDeathRate.x, sliderDeathRate.y - 7)
    text('Prob. of getting infected when vaccinated', sliderVaccineEfficiency.x, sliderVaccineEfficiency.y - 7)
    text('Prob. of death when vaccinated + infected', sliderVaccineDeathRate.x, sliderVaccineDeathRate.y - 7)

    textSize(20)
    text('🔄 Initial parameters', windowWidth - 250, sliderHealTime.y + 90)

    text('⏩ Simulation speed (framerate)', sliderFrameRate.x, sliderFrameRate.y - 10)
    textSize(15)
    text(sliderFrameRate.value() + " FPS", sliderFrameRate.x - 50, sliderFrameRate.y + 15)

    textSize(15)
    text('Initial vaccine rate (%)', sliderVaccineRate.x, sliderVaccineRate.y - 10)
    text(sliderVaccineRate.value()+"%", sliderVaccineRate.x - 40, sliderVaccineRate.y + 15)

    textSize(30)
    text('⚠️', 10, windowHeight - 20)
    textSize(13)
    text('This is not meant to be an accurate simulation of a real world epidemy.', 50, windowHeight - 30)
    text('There is no movement, and each person can only transmit to the 4 persons surrounding it, unlike the natural spreading of diseases.',
    50, windowHeight - 15)

    textSize(11)
    text('powered by bastoo0 - 2021', windowWidth - 150, windowHeight - 10)
    githubLink.position(pauseButton.x, pauseButton.y - 70);

    population.draw()

    textSize(20)

    fill(GREY)
    circle(600, yPeople * size + 30, size)
    fill(WHITE)
    text('Healthy', 620, yPeople * size + 38)

    fill(BLUE)
    circle(600, yPeople * size + 60, size)
    fill(WHITE)
    text('Vaccinated', 620, yPeople * size + 68)

    fill(ORANGE)
    circle(800, yPeople * size + 30, size)
    fill(WHITE)
    text('Recovered', 620, yPeople * size + 98)
    textSize(12)
    text('Recovered behave the same as "vaccinated"', 620, yPeople * size + 115)

    textSize(20)
    fill(LIGHTGREEN)
    circle(600, yPeople * size + 90, size)
    fill(WHITE)
    text('Infected', 820, yPeople * size + 38)
    
    fill(RED)
    circle(800, yPeople * size + 60, size)
    fill(WHITE)
    text('Dead', 820, yPeople * size + 68)
    


    if(animationEnabled) {
        animationButton.text = "Disable animation"
        animationButton.color = ORANGE
    }
    else {
        animationButton.text = "Enable animation"
        animationButton.color = GREEN
    }

    if(paused) {
        pauseButton.text = "Resume"
        pauseButton.color = WHITE
    }
    else {
        pauseButton.text = "Pause"
        pauseButton.color = GREY
    }

    resetButton.draw()
    pauseButton.draw()
    animationButton.draw()
    if(dayCounting) dayCount++
}

function reset() {
    xPeople = Math.floor(windowWidth / 26)
    if(xPeople % 2 == 1) xPeople++
    yPeople = Math.floor(windowHeight / 26)
    if(yPeople % 2 == 1) yPeople++
    population = new Population(size, xPeople, yPeople, vaccineRate)
    dayCount = 0
    dayCounting = false
    infectedCount = 0
}

function mousePressed() {
    if(mouseX >= pauseButton.x && mouseY >= pauseButton.y
        && mouseX < pauseButton.x + pauseButton.width && mouseY < pauseButton.y + pauseButton.height) {
        if(paused) {
            loop()
            paused = false
        } else {
            noLoop()
            paused = true
        }
    }
    population.checkColors()
}
