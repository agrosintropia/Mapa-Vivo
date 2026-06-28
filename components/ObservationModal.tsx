'use client';

import { useState, useRef } from 'react';
import type { TreeData } from '@/lib/types';

const OBSERVATION_TYPES = [
  { id: 'saude', label: 'Saúde da árvore', icon: '🩺' },
  { id: 'frutificacao', label: 'Frutificação', icon: '🍎' },
  { id: 'floracao', label: 'Floração', icon: '🌸' },
  { id: 'fauna', label: 'Fauna observada', icon: '🦜' },
  { id: 'identificacao', label: 'Sugerir identificação', icon: '🔍' },
  { id: 'outro', label: 'Outra observação', icon: '📋' },
];

interface Props {
  tree: TreeData;
  projectSlug: string;
  onClose: () => void;
}

export default function ObservationModal({ tree, projectSlug, onClose }: Props) {
  const [type, setType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function removeAudio() {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  }

  async function handleSubmit() {
    if (!type) {
      alert('Selecione o tipo de observação.');
      return;
    }
    if (!description && !audioBlob && photos.length === 0) {
      alert('Adicione uma descrição, foto ou áudio.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('treeId', tree.id);
      formData.append('type', type);
      formData.append('description', description);
      photos.forEach((photo) => formData.append('photos', photo));
      if (audioBlob) formData.append('audio', audioBlob, 'audio.webm');

      const res = await fetch(`/api/projects/${projectSlug}/observations`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao enviar observação.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      alert('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-verde-cerrado">Observação enviada!</h2>
          <p className="text-gray-600 text-sm">
            Sua observação sobre <strong>{tree.species.common_name}</strong> foi registrada
            e será revisada pelo gestor do projeto.
          </p>
          <button onClick={onClose} className="btn-primary">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="font-bold text-verde-cerrado">Relatar observação</h2>
            <p className="text-xs text-gray-500">{tree.species.common_name} · {tree.qr_slug}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Type selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Tipo de observação</label>
            <div className="grid grid-cols-2 gap-2">
              {OBSERVATION_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`text-left p-3 rounded-lg border-2 transition-all text-sm cursor-pointer ${
                    type === t.id
                      ? 'border-verde-medio bg-verde-claro/20'
                      : 'border-gray-200 hover:border-verde-claro'
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="ml-2">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Identification hint */}
          {type === 'identificacao' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium mb-1">Você conhece esta espécie?</p>
              <p className="text-xs">
                Informe o nome popular (e científico, se souber) na descrição abaixo.
                {tree.species.common_name === 'Não identificada'
                  ? ' Esta árvore ainda não foi identificada — sua sugestão será muito útil!'
                  : ' Sua sugestão será revisada pelo gestor ou técnico do projeto.'}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {type === 'identificacao' ? 'Nome da espécie sugerida' : 'Descrição'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'identificacao'
                ? 'Ex: Ipê-amarelo (Handroanthus albus) — é muito comum na região...'
                : 'Descreva o que você observou...'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-24 focus:ring-2 focus:ring-verde-medio/50 focus:border-verde-medio outline-none"
            />
          </div>

          {/* Audio recording */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Áudio (opcional)</label>
            {audioUrl ? (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <audio src={audioUrl} controls className="flex-1 h-8" />
                <button onClick={removeAudio} className="text-red-500 text-sm hover:underline cursor-pointer">Remover</button>
              </div>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isRecording ? '⏹ Parar gravação' : '🎙 Gravar áudio'}
              </button>
            )}
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Fotos (até 5)</label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-16 h-16">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-verde-medio hover:text-verde-medio transition-colors cursor-pointer"
                >
                  📷
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando...' : 'Enviar observação'}
          </button>
        </div>
      </div>
    </div>
  );
}
