import jsnes from 'jsnes'
import fs from 'fs'

const NES_WIDTH = 256
const NES_HEIGHT = 240
const TOTAL_PIXELS = NES_WIDTH * NES_HEIGHT
const FRAME_SPEED = 1000 / 60

function keyboard(callback, event) {
  var player = 1;
	switch(event.keyCode){
		case 38: // UP
			callback(player, jsnes.Controller.BUTTON_UP); break;
		case 40: // Down
			callback(player, jsnes.Controller.BUTTON_DOWN); break;
		case 37: // Left
			callback(player, jsnes.Controller.BUTTON_LEFT); break;
		case 39: // Right
			callback(player, jsnes.Controller.BUTTON_RIGHT); break;
		case 65: // 'a' - qwerty, dvorak
		case 81: // 'q' - azerty
			callback(player, jsnes.Controller.BUTTON_A); break;
		case 83: // 's' - qwerty, azerty
		case 79: // 'o' - dvorak
			callback(player, jsnes.Controller.BUTTON_B); break;
		case 9: // Tab
			callback(player, jsnes.Controller.BUTTON_SELECT); break;
		case 13: // Return
			callback(player, jsnes.Controller.BUTTON_START); break;
		default: break;
	}
}

runOnce(() => {
  html`<canvas id="snes-canvas"/>`

  const c = document.getElementById('snes-canvas')
  c.width = NES_WIDTH
  c.height = NES_HEIGHT
  const ctx = c.getContext('2d')
  state.imageData = ctx.getImageData(0, 0, NES_WIDTH, NES_HEIGHT)
  const buffer = new ArrayBuffer(state.imageData.data.length)
  const u32Buffer = new Uint32Array(buffer)
  const u8Buffer = new Uint8ClampedArray(buffer)  
  state.nes = new jsnes.NES({
    onFrame: rgb => {
      for(var i=0; i<TOTAL_PIXELS; i++){
        u32Buffer[i] = 0xff000000 | rgb[i]  	
      }
      state.imageData.data.set(u8Buffer)
      stateUpdated('imageData')
    	ctx.putImageData(state.imageData, 0, 0)
    }
  })

  document.addEventListener('keydown', e => {
    keyboard(state.nes.buttonDown, e)
  })
  document.addEventListener('keyup', e => {
    keyboard(state.nes.buttonUp, e)
  })
})

if(state.rom){  
  const romData = fs.readFileSync(state.rom, { encoding: 'binary' })
	state.nes.loadROM(romData)
  state.lastTime = performance.now()

  for(;;){
    const currentTime = performance.now()        
    if(currentTime - state.lastTime > FRAME_SPEED){      
      state.nes.frame()      
      state.lastTime = currentTime
    }    
    yield
  }
}
