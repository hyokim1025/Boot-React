const FetchingModal = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
    role="status">
    <div className="rounded-3xl bg-white px-10 py-12 text-4xl font-extrabold text-orange-400">
      Loading.....
    </div>
  </div>
);

export default FetchingModal;
