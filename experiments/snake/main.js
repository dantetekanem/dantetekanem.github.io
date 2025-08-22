import * as THREE from "three";
import { Game } from "./game.js";

window.addEventListener("load", () => {
  try {
    window.game = new Game();
  } catch (error) {
    console.error("Failed to initialize game:", error);
    document.getElementById("gameCanvas").innerHTML =
      '<div style="color: white; text-align: center; padding: 50px;">Error: Failed to initialize game. Check console for details.</div>';
  }
});
