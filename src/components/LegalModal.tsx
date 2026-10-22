import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#17211D] text-[#F4F0E7]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C8D6B0]" />
            <h3 className="font-heading text-lg font-bold text-[#F4F0E7]">
              {type === 'privacy' ? 'NF ESTATE GROUP — Privacy Policy' : 'Terms & Conditions'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700 space-y-4 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <div>
                <h4 className="font-bold text-sm text-[#17211D] mb-1">1. Scope & Primary Jurisdiction</h4>
                <p>
                  NF ESTATE GROUP ("we", "our", or "us") operates exclusively within Gujarat, India under the motto <em>"Your Future. Our Foundation."</em> This Privacy Policy describes how we collect, store, and safeguard your personal details when you access our Gujarat real estate platform or submit property enquiries.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#17211D] mb-1">2. Information We Collect</h4>
                <p>
                  We collect strictly necessary customer information required for account authentication, advisory coordination, and property site inspections:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Account Identity:</strong> Full legal name, verified email address, phone number, and cryptographically hashed passwords.</li>
                  <li><strong>Gujarat Search Preferences:</strong> Selected Gujarat cities, localities, categories (Residential, Commercial, Industrial), and budget ranges.</li>
                  <li><strong>Enquiry Records:</strong> Selected property ID, notes, and preferred communication medium (Phone Call, WhatsApp, Email).</li>
                  <li><strong>No GPS Tracking:</strong> We never capture background device GPS location without explicit affirmative action; manual Gujarat city and locality selection is always standard.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#17211D] mb-1">3. How Your Information Is Used</h4>
                <p>
                  Your details are utilized solely for:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Connecting you with verified Gujarat property documentation and title checks.</li>
                  <li>Scheduling escorted site visits and gate passes for residential, commercial, and industrial sites.</li>
                  <li>Providing access to your confidential "My Account" enquiry tracking dashboard.</li>
                  <li>Internal owner review of unverified seller property submissions.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#17211D] mb-1">4. Data Storage & Security Controls</h4>
                <p>
                  All enquiry data and customer profiles are stored in server-authoritative databases with Row Level Security (RLS) enforcement. Unauthenticated public users have zero access to customer contact details. Passwords are salted and hashed using PBKDF2/SHA-512 algorithms; plain-text passwords are never stored.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#17211D] mb-1">5. Customer Access & Deletion Rights</h4>
                <p>
                  In accordance with applicable Indian digital data protection standards, you may request full export or deletion of your account records and submitted enquiries by contacting our compliance desk at <strong>privacy@nfestategroup.com</strong>.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-sm text-[#17211D] mb-1">1. Gujarat Regional Exclusivity</h4>
                <p>
                  NF ESTATE GROUP provides real estate advisory and listing services exclusively within Gujarat, India. Any property inquiries or submissions outside Gujarat are automatically invalid.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#17211D] mb-1">2. Verification Standards</h4>
                <p>
                  While NF ESTATE GROUP verifies land titles, town planning approvals, and builder credentials prior to publication, users are advised to review physical documents and statutory approvals prior to commercial closing.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#17211D] mb-1">3. Owner Listings & Submissions</h4>
                <p>
                  Submissions through "Have a Property to List?" are subject to manual administrative review and title validation. NF ESTATE GROUP reserves the right to decline or request statutory certifications for any submitted listing.
                </p>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#17211D] text-[#F4F0E7] text-xs font-semibold rounded-lg hover:bg-[#23312C]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
