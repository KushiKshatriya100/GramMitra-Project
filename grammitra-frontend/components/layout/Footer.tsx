export default function Footer() {
  return (
    <footer className="bg-dark text-white py-10 px-6 text-center">
      <h2 className="text-lg font-semibold mb-2">
        GramMitra 🌾
      </h2>

      <p className="text-sm text-gray-300">
        Connecting villages to opportunities
      </p>

      <p className="text-xs text-gray-400 mt-4">
        © {new Date().getFullYear()} GramMitra. All rights reserved.
      </p>
    </footer>
  );
}