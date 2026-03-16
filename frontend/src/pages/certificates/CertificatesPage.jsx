import { useMemo, useRef, useState } from "react";
import { Award, Download, Search } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { lookupCertificateById } from "../../services/certificateApi";
import { exportElementAsA4Pdf } from "../../utils/certificatePdf";
import { sanitizeFileName } from "../../utils/exportUtils";

const formatDate = (value) => {
  if (!value) {
    return "Present";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Present";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const todayText = new Date().toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const CertificatesPage = () => {
  const [lookupId, setLookupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState(null);
  const [companyName, setCompanyName] = useState("Shriram Solutions Pvt. Ltd.");
  const [descriptionOfWork, setDescriptionOfWork] = useState("");
  const [pdfExporting, setPdfExporting] = useState(false);

  const certificateRef = useRef(null);

  const handleLookup = async () => {
    const trimmed = lookupId.trim();

    if (!trimmed) {
      setError("Please enter an Employee ID, Intern ID, or Trainee ID.");
      setRecord(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await lookupCertificateById(trimmed);
      const payload = response?.data || null;

      if (!payload) {
        setRecord(null);
        setError("No matching record found.");
        return;
      }

      setRecord(payload);
      setCompanyName(payload.companyName || "Shriram Solutions Pvt. Ltd.");
      setDescriptionOfWork(payload.descriptionOfWork || "");
    } catch (lookupError) {
      setRecord(null);
      setError(lookupError?.message || "Unable to fetch certificate details.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!record || !certificateRef.current) {
      return;
    }

    try {
      setPdfExporting(true);
      const filePart = sanitizeFileName(record.id || record.name || "certificate");

      await exportElementAsA4Pdf({
        element: certificateRef.current,
        fileName: `experience-certificate-${filePart}.pdf`,
      });
    } catch (exportError) {
      setError(exportError?.message || "Failed to export certificate as PDF.");
    } finally {
      setPdfExporting(false);
    }
  };

  const certificateContent = useMemo(() => {
    if (!record) {
      return null;
    }

    return {
      ...record,
      companyName: companyName.trim() || "Shriram Solutions Pvt. Ltd.",
      descriptionOfWork: descriptionOfWork.trim() || record.descriptionOfWork || "",
    };
  }, [companyName, descriptionOfWork, record]);

  return (
    <AdminLayout pageTitle="Certificates">
      <div className="mx-auto max-w-6xl space-y-5">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <CardTitle className="text-base font-bold text-slate-800">Generate Experience Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="space-y-1 lg:col-span-2">
                <Label htmlFor="lookup-id" className="text-xs text-slate-500">
                  Employee ID / Intern ID / Trainee ID
                </Label>
                <Input
                  id="lookup-id"
                  value={lookupId}
                  onChange={(event) => setLookupId(event.target.value)}
                  placeholder="Example: EMP00001 or INT00001 or TRN00001"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" className="w-full gap-2" onClick={handleLookup} disabled={loading}>
                  <Search className="h-4 w-4" />
                  {loading ? "Searching..." : "Fetch Details"}
                </Button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            {record && (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="companyName" className="text-xs text-slate-500">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Company name"
                  />
                </div>

                <div className="flex items-end justify-start lg:justify-end">
                  <Button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={pdfExporting}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {pdfExporting ? "Exporting..." : "Export PDF"}
                  </Button>
                </div>

                <div className="space-y-1 lg:col-span-2">
                  <Label htmlFor="descriptionOfWork" className="text-xs text-slate-500">Description of Work</Label>
                  <textarea
                    id="descriptionOfWork"
                    rows={4}
                    value={descriptionOfWork}
                    onChange={(event) => setDescriptionOfWork(event.target.value)}
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
                    placeholder="Work summary"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {certificateContent && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div
              ref={certificateRef}
              className="relative mx-auto w-[794px] min-h-[1123px] bg-white p-14 text-slate-800"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 10%, rgba(59,130,246,0.06), transparent 30%), radial-gradient(circle at 90% 90%, rgba(14,116,144,0.07), transparent 28%)",
              }}
            >
              <div className="absolute left-6 top-6 h-20 w-20 rounded-full border-4 border-blue-100" />
              <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full border-4 border-indigo-100" />

              <div className="relative z-10 h-full border-[10px] border-double border-slate-200 px-12 py-10">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Official Certificate</p>
                  <h2 className="mt-3 text-4xl font-serif font-bold uppercase tracking-[0.1em] text-slate-800">
                    Experience Certificate
                  </h2>
                  <div className="mx-auto mt-5 h-1 w-32 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600" />
                </div>

                <div className="mt-10 space-y-5 text-[17px] leading-8 text-slate-700">
                  <p>This is to certify that</p>
                  <p className="text-3xl font-semibold text-slate-900">{certificateContent.name}</p>
                  <p>
                    ({certificateContent.id}) served as <span className="font-semibold">{certificateContent.role}</span> in the
                    <span className="font-semibold"> {certificateContent.department}</span> department at
                    <span className="font-semibold"> {certificateContent.companyName}</span>.
                  </p>
                  <p>
                    The tenure was from <span className="font-semibold">{formatDate(certificateContent.startDate)}</span> to
                    <span className="font-semibold"> {formatDate(certificateContent.endDate)}</span>.
                  </p>
                  <p>{certificateContent.descriptionOfWork}</p>
                  <p>
                    During this period, the individual demonstrated professionalism, discipline, and valuable contribution to the team.
                    We appreciate the commitment shown and wish them all the best in future endeavors.
                  </p>
                </div>

                <div className="mt-16 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-slate-500">Issued Date</p>
                    <p className="mt-2 border-t border-slate-300 pt-2 text-sm font-medium text-slate-700">{todayText}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Authorized Signatory</p>
                    <p className="mt-2 border-t border-slate-300 pt-2 text-sm font-medium text-slate-700">Human Resources</p>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
                  <Award className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.2em]">Verified by HR Management System</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CertificatesPage;
