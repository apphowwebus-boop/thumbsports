import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { CATALOG, type MainCategory, type ProductSpec, type SubCategory } from '../data/catalog';

interface CatalogDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToMain: (main: MainCategory) => void;
  onJumpToSub: (main: MainCategory, sub: SubCategory) => void;
  onJumpToProduct: (main: MainCategory, sub: SubCategory, product: ProductSpec) => void;
}

export const CatalogDirectoryModal: React.FC<CatalogDirectoryModalProps> = ({
  isOpen,
  onClose,
  onJumpToMain,
  onJumpToSub,
  onJumpToProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="fixed inset-0 bg-black/45" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Manufacturing Category Directory"
        className="relative z-10 w-full max-w-5xl max-h-[86vh] bg-[#F7F6F3] border border-black/15 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white">
          <div>
            <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-[#141413]">
              Full Manufacturing Catalog Index
            </h2>
            <p className="text-xs text-neutral-500">
              Jump directly to any Main Category wall, Sub-Category wall, or SKU configurator
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close catalog index"
            className="p-2 text-neutral-600 hover:text-[#141413] hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATALOG.map((main) => (
            <div key={main.id} className="bg-white border border-black/10 p-5 flex flex-col">
              <button
                type="button"
                onClick={() => {
                  onJumpToMain(main);
                  onClose();
                }}
                className="group text-left pb-3 border-b border-black/10"
              >
                <div className="font-mono text-[11px] text-neutral-500 uppercase">
                  {main.code} · {main.gsmRange}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-display text-2xl font-semibold uppercase text-[#141413] group-hover:underline">
                    {main.name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#141413] transition-colors" />
                </div>
              </button>

              <div className="mt-4 space-y-4">
                {main.subCategories.map((sub) => (
                  <div key={sub.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToSub(main, sub);
                        onClose();
                      }}
                      className="text-left text-xs font-semibold uppercase tracking-wider text-[#141413] hover:underline"
                    >
                      {sub.name}
                    </button>
                    <ul className="mt-1.5 space-y-1">
                      {sub.products.map((prod) => (
                        <li key={prod.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onJumpToProduct(main, sub, prod);
                              onClose();
                            }}
                            className="w-full text-left flex items-center justify-between text-xs text-neutral-600 hover:text-[#141413] py-0.5"
                          >
                            <span className="truncate pr-2">{prod.name}</span>
                            <span className="font-mono text-[11px] text-neutral-400 shrink-0">
                              {prod.sku}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
