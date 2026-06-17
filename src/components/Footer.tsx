export default function Footer() {
  return (
    <footer className="bg-dolipa-ink text-dolipa-cream mt-auto px-6 py-8 text-center text-sm">
      <p className="font-serif text-base mb-2">DOLIPA STORE -- Ropa Importada -- Villa Carlos Paz</p>
      <p className="opacity-80 mb-3">Envíos a todo el Valle de Punilla</p>
      <div className="flex justify-center gap-4">
        <a
          href="https://www.instagram.com/dolipa_store"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Instagram
        </a>
        <a
          href="https://wa.me/5493541641493"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          WhatsApp
        </a>
      </div>
    </footer>
  );
}
