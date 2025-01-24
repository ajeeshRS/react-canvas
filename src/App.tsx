import { useEffect, useRef, useState } from "react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  interface Shape {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  let currentShapes: Shape[] = [];
  const selectedRef = useRef<number | null>(null);
  const [isMoving, setMoving] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setAttribute("tabindex", "0");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let clicked = false;
      let startX = 0;
      let startY = 0;

      const isPointInShape = (x: number, y: number, shape: Shape) => {
        const withinX = x >= shape.x && x <= shape.x + shape.width;
        const withinY = y >= shape.y && y <= shape.y + shape.height;

        return withinX && withinY;
      };

      // canvas redraw logic
      const redrawCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0,0,0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        currentShapes?.forEach(({ x, y, width, height }, i: number) => {
          const isSelected = i === selectedRef.current;
          ctx.strokeStyle = isSelected ? "rgba(0,255,0)" : "rgba(255,255,255)";
          ctx.beginPath();
          ctx.roundRect(x, y, width, height, [20]);
          ctx.stroke();
        });
      };

      // handle shape deletion
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Backspace" && selectedRef.current !== null) {
          if (selectedRef.current !== null) {
            currentShapes.splice(selectedRef.current, 1);
            selectedRef.current = null;
            redrawCanvas();
          }
        }
      };

      // mouse down handler
      const handleMouseDown = (e: MouseEvent) => {
        clicked = true;

        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.x;
        startY = e.clientY - rect.y;

        for (let i = 0; i < currentShapes.length; i++) {
          const shape = currentShapes[i];

          if (isPointInShape(startX, startY, shape)) {
            selectedRef.current = i;

            redrawCanvas();
            setMoving(true);
            setStartPos({ x: startX, y: startY });
            return;
          }
        }
        selectedRef.current = null;
        redrawCanvas();
      };

      // mouse up handler
      const handleMouseUp = (e: MouseEvent) => {
        clicked = false;

        const rect = canvas.getBoundingClientRect();

        const width = e.clientX - rect.x - startX;
        const height = e.clientY - rect.y - startY;

        const shape: Shape = {
          x: startX,
          y: startY,
          width,
          height,
        };

        currentShapes.push(shape);
        redrawCanvas();
      };

      // mouse move handler
      const handleMouseMove = (e: MouseEvent) => {
        if (clicked) {
          const rect = canvas.getBoundingClientRect();

          if (isMoving && selectedRef.current !== null) {
            const mouseX = e.clientX - rect.x;
            const mouseY = e.clientY - rect.y;
            const dx = mouseX - startPos.x;
            const dy = mouseY - startPos.y;

            const newShapes = [...currentShapes];

            newShapes[selectedRef.current] = {
              ...currentShapes[selectedRef.current],
              x: currentShapes[selectedRef.current].x + dx,
              y: currentShapes[selectedRef.current].y + dy,
            };

            currentShapes = newShapes;
            setStartPos({ x: mouseX, y: mouseY });
            redrawCanvas();
          } else {
            const width = e.clientX - rect.x - startX;
            const height = e.clientY - rect.y - startY;

            redrawCanvas();

            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.beginPath();
            ctx.roundRect(startX, startY, width, height, [20]);
            ctx.stroke();
          }
        }
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("keydown", handleKeyDown);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  return (
    <div className="h-screen w-screen">
      <canvas
        ref={canvasRef}
        width={2000}
        height={1000}
        className="bg-black †ext-white"
      ></canvas>
    </div>
  );
}

export default App;
