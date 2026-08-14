"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("covers").getPublicUrl(path);

      onChange(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar a imagem");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {hint && <p className="field-hint">{hint}</p>}
      {value && (
        <div className="image-preview">
          <Image src={value} alt="" width={160} height={160} />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading && <p className="field-hint">Enviando…</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
