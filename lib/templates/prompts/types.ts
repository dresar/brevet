export interface ModulPromptConfig {
  judul: string;
  kategori: 'Dasar' | 'PPh' | 'PPN' | 'Lainnya' | string;
  kesulitan: 'pemula' | 'menengah' | 'lanjut' | string;
  menit: number;
  fokus: string;
}
