export function playSuccessSound(): void {
  process.stdout.write('\x07');
}
