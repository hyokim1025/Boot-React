const PageComponent = ({ serverData, movePage, ariaLabel = 'Todo pages' }) => {
  const { prev, prevPage, pageNumList, current, next, nextPage } = serverData;

  if (!pageNumList.length && !prev && !next) {
    return null;
  }

  return (
    <nav className="m-6 flex flex-wrap justify-center" aria-label={ariaLabel}>
      {prev && (
        <button type="button" className="m-2 p-2 w-16 font-bold text-blue-400"
          onClick={() => movePage({ page: prevPage })}>
          Prev
        </button>
      )}
      {pageNumList.map((page) => (
        <button type="button" key={page} aria-current={current === page ? 'page' : undefined}
          className={`m-2 p-2 w-12 rounded shadow-md text-white ${current === page ? 'bg-gray-500' : 'bg-blue-400'}`}
          onClick={() => movePage({ page })}>
          {page}
        </button>
      ))}
      {next && (
        <button type="button" className="m-2 p-2 w-16 font-bold text-blue-400"
          onClick={() => movePage({ page: nextPage })}>
          Next
        </button>
      )}
    </nav>
  );
};

export default PageComponent;
