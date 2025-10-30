
const canvas = document.getElementById('atomCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.parentElement.offsetWidth;
canvas.height = canvas.parentElement.offsetHeight;

const centerX = canvas.width/2;
const centerY = canvas.height/2;

// ---------- Atom Settings ----------
const nucleusRadius = 20;

// Solid orbit rings with rotation speeds
const rings = [
    { electrons: 2, radius: 80, color: '#6ec3f4', angleX: 0, angleY: 0, speedX: 0.004, speedY: 0.006 },
    { electrons: 2, radius: 120, color: '#eae2ff', angleX: 0, angleY: 0, speedX: 0.003, speedY: -0.005 },
    { electrons: 1, radius: 160, color: '#b9beff', angleX: 0, angleY: 0, speedX: 0.005, speedY: 0.004 } // moving ring
];

let electrons = [];

// Assign electrons to rings
rings.forEach(ring => {
    for(let i=0; i<ring.electrons; i++){
        electrons.push({
            ring: ring,
            angle: (2*Math.PI / ring.electrons) * i,
        });
    }
});

// ---------- Drag Controls ----------
let angleXGlobal = 0, angleYGlobal = 0;
let isDragging = false, previousX, previousY;

canvas.addEventListener('mousedown', e => {
    isDragging = true;
    previousX = e.clientX;
    previousY = e.clientY;
});
window.addEventListener('mouseup', () => isDragging = false);
window.addEventListener('mousemove', e => {
    if(isDragging){
        const deltaX = e.clientX - previousX;
        const deltaY = e.clientY - previousY;
        angleYGlobal += deltaX * 0.005;
        angleXGlobal -= deltaY * 0.005;
        previousX = e.clientX;
        previousY = e.clientY;
    }
});

// ---------- Draw Functions ----------
function drawRing(ring){
    ctx.beginPath();
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 2; // solid line

    const points = 60;
    for(let i=0; i<=points; i++){
        const theta = (i / points) * 2 * Math.PI;
        let x = ring.radius * Math.cos(theta);
        let y = ring.radius * Math.sin(theta);
        let z = 0;

        // Rotate ring around X & Y axes
        let yRot = y * Math.cos(ring.angleX) - z * Math.sin(ring.angleX);
        let zRot = y * Math.sin(ring.angleX) + z * Math.cos(ring.angleX);
        let xRot = x * Math.cos(ring.angleY) + zRot * Math.sin(ring.angleY);
        zRot = -x * Math.sin(ring.angleY) + zRot * Math.cos(ring.angleY);

        // Global rotation
        let xFinal = xRot;
        let yFinal = yRot * Math.cos(angleXGlobal) - zRot * Math.sin(angleXGlobal);
        let zFinal = yRot * Math.sin(angleXGlobal) + zRot * Math.cos(angleXGlobal);
        xFinal = xFinal * Math.cos(angleYGlobal) + zFinal * Math.sin(angleYGlobal);

        if(i === 0) ctx.moveTo(centerX + xFinal, centerY + yFinal);
        else ctx.lineTo(centerX + xFinal, centerY + yFinal);
    }
    ctx.stroke();
}

function drawElectron(e){
    const ring = e.ring;
    e.angle += 0.01; // electron orbit speed

    let x = ring.radius * Math.cos(e.angle);
    let y = ring.radius * Math.sin(e.angle);
    let z = 0;

    // Rotate ring in 3D
    let yRot = y * Math.cos(ring.angleX) - z * Math.sin(ring.angleX);
    let zRot = y * Math.sin(ring.angleX) + z * Math.cos(ring.angleX);
    let xRot = x * Math.cos(ring.angleY) + zRot * Math.sin(ring.angleY);
    zRot = -x * Math.sin(ring.angleY) + zRot * Math.cos(ring.angleY);

    // Global rotation
    let xFinal = xRot;
    let yFinal = yRot * Math.cos(angleXGlobal) - zRot * Math.sin(angleXGlobal);
    let zFinal = yRot * Math.sin(angleXGlobal) + zRot * Math.cos(angleXGlobal);
    xFinal = xFinal * Math.cos(angleYGlobal) + zFinal * Math.sin(angleYGlobal);

    // Draw electron
    ctx.beginPath();
    ctx.fillStyle = ring.color;
    ctx.shadowColor = ring.color;
    ctx.shadowBlur = 15;
    ctx.arc(centerX + xFinal, centerY + yFinal, 6, 0, Math.PI*2);
    ctx.fill();
}

// ---------- Animation ----------
function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Rotate rings
    rings.forEach(r => {
        r.angleX += r.speedX;
        r.angleY += r.speedY;
        drawRing(r);
    });

    // Draw nucleus
    ctx.beginPath();
    const nucleusGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, nucleusRadius);
    nucleusGradient.addColorStop(0,'#ffffff');
    nucleusGradient.addColorStop(1,'#7d2ed8');
    ctx.fillStyle = nucleusGradient;
    ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI*2);
    ctx.fill();

    // Draw electrons
    electrons.forEach(e => drawElectron(e));

    requestAnimationFrame(animate);
}

animate();

// ---------- Responsive ----------
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
