import React, { useState } from "react";
import { subirImagen, subirCancion, subirArchivo } from "../ApiServices/FileSerive";

export default function UploadMini() {
  const [foto, setFoto] = useState(null);
  const [audio, setAudio] = useState(null);

  const handleUpload = async () => {
    //const nombreBase = "amazo2n"; // O el ID que quieras usar como nombre

    // =========================
    //     SUBIR FOTO
    // =========================
    if (foto) {
      await subirArchivo(foto, "fotos/", foto.name);
      alert("Foto subida");
    }

    // =========================
    //     SUBIR AUDIO
    // =========================
    if (audio) {
      const extension = audio.name.split(".").pop().toLowerCase();
        let carpetaAudio = "";

      if (extension === "mp3") carpetaAudio = "mp3/";
      if (extension === "wav") carpetaAudio = "wav/";
      if (extension === "flac") carpetaAudio = "flac/";

      await subirArchivo(audio, carpetaAudio, audio.name);
      alert("Canción subida");
    }
  };

  return (
    <div>
      <h3>Subir archivos</h3>

      {/* FOTO */}
      <div>
        <label>Foto:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFoto(e.target.files[0])} 
        />
      </div>

      <br />

      {/* AUDIO */}
      <div>
        <label>Canción:</label>
        <input 
          type="file" 
          accept=".mp3,.wav,.flac" 
          onChange={(e) => setAudio(e.target.files[0])} 
        />
      </div>

      <br />

      <button onClick={handleUpload}>Subir archivos</button>
    </div>
  );
}
