import React from 'react';
import { X } from 'lucide-react';

interface CapabilitiesModalProps {
  mode: 'capabilities' | 'sizing' | null;
  onClose: () => void;
}

export const CapabilitiesModal: React.FC<CapabilitiesModalProps> = ({ mode, onClose }) => {
  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="fixed inset-0 bg-black/45" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label={mode === 'capabilities' ? 'Factory Capabilities' : 'MOQ & Sizing Standards'}
        className="relative z-10 w-full max-w-3xl max-h-[85vh] bg-[#F7F6F3] border border-black/15 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-[#141413]">
            {mode === 'capabilities'
              ? 'Thumb Sports Industries — Factory Capabilities'
              : 'Thumb Sports Industries — MOQ Tiers & Standard Grading'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-neutral-600 hover:text-[#141413] hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-700">
          {mode === 'capabilities' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-black/10 p-5">
                  <div className="font-mono text-xs text-neutral-500 uppercase">01. Knitting &amp; Dye House</div>
                  <h3 className="font-semibold text-[#141413] mt-1">Custom GSM Milling (260 – 600 GSM)</h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Vertical circular knitting for diagonal French terry, brushed fleece, and dry-hand
                    open-end jersey. Pantone TCX reactive dyeing, potassium acid wash, and enzyme
                    stone washing under one roof.
                  </p>
                </div>
                <div className="bg-white border border-black/10 p-5">
                  <div className="font-mono text-xs text-neutral-500 uppercase">02. Print &amp; Embellishment</div>
                  <h3 className="font-semibold text-[#141413] mt-1">Puff, Plastisol, Chenille &amp; DTG</h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    14-station automatic screenprint carousels for high-build puff, discharge waterbase,
                    and vintage crackle inks alongside Tajima multi-head embroidery and chenille patches.
                  </p>
                </div>
                <div className="bg-white border border-black/10 p-5">
                  <div className="font-mono text-xs text-neutral-500 uppercase">03. Cut &amp; Sew Patterning</div>
                  <h3 className="font-semibold text-[#141413] mt-1">CAD Gerber Grading &amp; Prototyping</h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Dedicated sample room delivering physical proto garments in 7–10 business days
                    from your tech pack or our verified boxy streetwear blocks.
                  </p>
                </div>
                <div className="bg-white border border-black/10 p-5">
                  <div className="font-mono text-xs text-neutral-500 uppercase">04. Hardware &amp; Finishing</div>
                  <h3 className="font-semibold text-[#141413] mt-1">Private Label &amp; Trims</h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Custom engraved YKK zippers, woven satin/damask neck labels, satin care tags,
                    hangtags, and barcode-ready frosted zip polybags.
                  </p>
                </div>
              </div>
              <div className="border-t border-black/10 pt-4 flex flex-wrap gap-6 font-mono text-xs text-neutral-600 tabular-nums">
                <span>Monthly Capacity: 85,000 pcs</span>
                <span>AQL 2.5 Final Inspection</span>
                <span>OEKO-TEX Standard 100 Yarns</span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border border-black/10 p-5">
                <h3 className="font-semibold text-[#141413] text-base">Wholesale Volume Structure</h3>
                <table className="w-full text-xs text-left mt-3 border-collapse tabular-nums">
                  <thead>
                    <tr className="border-b border-black/10 font-mono text-neutral-500 uppercase">
                      <th className="py-2 pr-4">Order Tier</th>
                      <th className="py-2 pr-4">Quantity</th>
                      <th className="py-2 pr-4">Lead Time</th>
                      <th className="py-2">Included Trims</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-[#141413]">Proto / Fit Sample</td>
                      <td className="py-2.5 pr-4 font-mono">1 – 5 pcs</td>
                      <td className="py-2.5 pr-4 font-mono">7 – 10 Days</td>
                      <td className="py-2.5">Blank or strike-off print + DHL Air</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-[#141413]">Capsule MOQ</td>
                      <td className="py-2.5 pr-4 font-mono">50 pcs / colorway</td>
                      <td className="py-2.5 pr-4 font-mono">18 – 24 Days</td>
                      <td className="py-2.5">Custom print/embroidery + woven label</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-[#141413]">Growth Production</td>
                      <td className="py-2.5 pr-4 font-mono">200 pcs / style</td>
                      <td className="py-2.5 pr-4 font-mono">20 – 26 Days</td>
                      <td className="py-2.5">Custom Pantone dye + frosted polybags</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium text-[#141413]">Enterprise Bulk</td>
                      <td className="py-2.5 pr-4 font-mono">500+ pcs / style</td>
                      <td className="py-2.5 pr-4 font-mono">25 – 32 Days</td>
                      <td className="py-2.5">Custom hardware molds + FBA/3PL cartons</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                All size specs can be graded to your brand’s custom block or produced on our verified
                Thumb Sports Industries Athletic, BJJ Gi &amp; Boxy Streetwear blocks (XS – XXXL).
                Sample fees are 100% credited toward bulk orders of 200+ units.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
