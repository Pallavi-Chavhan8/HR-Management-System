import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Mail,
  Pencil,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { APP_ROUTES } from "../../routes/routeConfig";
import { deleteTrainee, getTraineeById } from "../../services/traineeApi";

const statusVariant = (status = "") => {
  const value = String(status).toLowerCase();
  if (value === "active") return "success";
  if (value === "completed") return "secondary";
  return "secondary";
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{value || "-"}</p>
    </div>
  </div>
);

const TraineeDetailsPage = () => {
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("Invalid trainee ID.");
      setLoading(false);
      return;
    }

    getTraineeById(id)
      .then((res) => {
        const item = res.data?.trainee || res.data || res;
        setTrainee(item);
      })
      .catch(() => setError("Could not load trainee details."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!trainee?._id) {
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this trainee?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteTrainee(trainee._id);
      navigate(APP_ROUTES.TRAINEES, { replace: true });
    } catch {
      setError("Could not delete trainee. Please try again.");
    }
  };

  return (
    <AdminLayout pageTitle="Trainee Details">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            className="gap-2 text-slate-600"
            onClick={() => navigate(APP_ROUTES.TRAINEES)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trainees
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => navigate(APP_ROUTES.TRAINEE_EDIT.replace(":id", id))}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {loading && (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </CardContent>
          </Card>
        )}

        {error && !loading && (
          <Card className="border-red-100 bg-red-50 shadow-sm">
            <CardContent className="py-6 text-center text-sm font-medium text-red-600">{error}</CardContent>
          </Card>
        )}

        {trainee && !loading && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow">
                  {(trainee.name || "?")[0].toUpperCase()}
                </span>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">{trainee.name}</CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-slate-500">{trainee.traineeId}</span>
                    <span className="text-slate-300">.</span>
                    <Badge variant={statusVariant(trainee.status || "ACTIVE")}>
                      {trainee.status || "ACTIVE"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
              <DetailRow icon={Mail} label="Email" value={trainee.email} />
              <DetailRow icon={Phone} label="Phone" value={trainee.phone} />
              <DetailRow icon={Calendar} label="Date of Birth" value={trainee.dateOfBirth ? new Date(trainee.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"} />
              <DetailRow icon={Building2} label="Department" value={trainee.department} />
              <DetailRow icon={BookOpen} label="Course" value={trainee.course || trainee.trainingProgram} />
              <DetailRow icon={Calendar} label="Internship Duration" value={trainee.internshipDuration || trainee.trainingDuration} />
              <DetailRow
                icon={Calendar}
                label="Start Date"
                value={trainee.startDate ? new Date(trainee.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
              />
              <DetailRow
                icon={Calendar}
                label="End Date"
                value={trainee.endDate ? new Date(trainee.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
              />
              <DetailRow icon={Activity} label="Status" value={trainee.status || "ACTIVE"} />
              <DetailRow icon={User} label="Trainee ID" value={trainee.traineeId} />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default TraineeDetailsPage;
