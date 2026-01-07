String humanize(String s) {
  final raw = s.toString();
  final cleaned = raw
      .replaceAll('_', ' ')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
  if (cleaned.isEmpty) return '';
  return cleaned
      .split(' ')
      .map(
        (w) => w.isEmpty
            ? ''
            : (w[0].toUpperCase() + (w.length > 1 ? w.substring(1) : '')),
      )
      .join(' ');
}
