import SmartCanvas from './widgets/SmartCanvas.jsx';

/**
 * WIDGET REGISTRY (AI-ONLY VERSION)
 * Tüm tasarım yetkisi Gemini'ye aittir.
 */
export const WIDGET_REGISTRY = {
  // Tek bir dinamik widget: Gemini ne hayal ederse o olur.
  dynamic_canvas: SmartCanvas,
  kpi_card: SmartCanvas,
  bar_chart: SmartCanvas,
  line_chart: SmartCanvas,
  pie_chart: SmartCanvas,
  comment_cards: SmartCanvas,
  smart_chips: SmartCanvas
};

export function getWidgetComponent(type) {
  // Hangi tip gelirse gelsin SmartCanvas'a yönlendir (Çünkü her şeyi AI tasarlayacak)
  return SmartCanvas;
}

export function isValidWidgetType(type) {
  return true;
}

export function getAvailableWidgetTypes() {
  return ['dynamic_canvas'];
}
