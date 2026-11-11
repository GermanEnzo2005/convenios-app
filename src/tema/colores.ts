export const paletas = {
  claro: {
    background: '#F2F0ED',
    surface: '#FFFFFF',
    header: '#1F3A5A',
    headerText: '#FFFFFF',
    headerSubtext: '#C9D3E0',
    accentLine: '#F5B800',
    title: '#8C2F2F',
    text: '#1A1A1A',
    textMuted: '#5F6368',
    border: '#C9C9C9',
    inputBg: '#FFFFFF',
    primary: '#0F5A9C',
    primaryText: '#FFFFFF',
    link: '#0F5A9C',
    error: '#B3261E',
    info: '#0F5A9C',
    infoBg: '#E1EDF8',
    success: '#1E7B5C',
    successBg: '#E3F2EC',
    warning: '#8A5A00',
    warningBg: '#FFF1CC',
    dangerBg: '#FBE5E3',
    neutralBg: '#ECEAE6',
  },
  oscuro: {
    background: '#0D1520',
    surface: '#16202D',
    header: '#0D1520',
    headerText: '#FFFFFF',
    headerSubtext: '#B8C2CF',
    accentLine: '#F5B800',
    title: '#F29B97',
    text: '#E8EDF3',
    textMuted: '#9AA6B5',
    border: '#3A4756',
    inputBg: '#16202D',
    primary: '#3B82D6',
    primaryText: '#FFFFFF',
    link: '#6FB0F5',
    error: '#FF8A80',
    info: '#8CC2F5',
    infoBg: '#142B44',
    success: '#5FD3A8',
    successBg: '#12362B',
    warning: '#F5C451',
    warningBg: '#3A2F10',
    dangerBg: '#3D1B19',
    neutralBg: '#232F3E',
  },
};

export type Paleta = typeof paletas.claro;

// Tono semántico para insignias
export type Tono = 'info' | 'exito' | 'advertencia' | 'peligro' | 'neutro';

export function colorDeTono(c: Paleta, t: Tono): string {
  return { info: c.info, exito: c.success, advertencia: c.warning, peligro: c.error, neutro: c.textMuted }[t];
}

export function fondoDeTono(c: Paleta, t: Tono): string {
  return { info: c.infoBg, exito: c.successBg, advertencia: c.warningBg, peligro: c.dangerBg, neutro: c.neutralBg }[t];
}