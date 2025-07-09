import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Users, UserCheck, UserX } from "lucide-react";

interface ApprovalRequest {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  microsoftId: string;
  requestReason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminPage() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/microsoft/admin/approval-requests'],
    queryFn: async () => {
      const response = await apiRequest('/api/microsoft/admin/approval-requests');
      return response.requests as ApprovalRequest[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, decision }: { requestId: number; decision: 'approved' | 'rejected' }) => {
      return await apiRequest(`/api/microsoft/admin/approval-requests/${requestId}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision, reviewNotes }),
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Decision Processed",
        description: variables.decision === 'approved' 
          ? "User has been approved and account created"
          : "User access has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/microsoft/admin/approval-requests'] });
      setSelectedRequest(null);
      setReviewNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process approval decision",
        variant: "destructive",
      });
    },
  });

  const handleDecision = (decision: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    approveMutation.mutate({ requestId: selectedRequest.id, decision });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    approved: requests?.filter(r => r.status === 'approved').length || 0,
    rejected: requests?.filter(r => r.status === 'rejected').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00728e] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BPN Admin Panel</h1>
          <p className="text-gray-600">Manage user access requests for BPN Corporate Assistant</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <UserX className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Access Requests</CardTitle>
              <CardDescription>
                Review and manage user access requests for the BPN Corporate Assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No access requests found</p>
                )}
                
                {requests?.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id 
                        ? 'border-[#00728e] bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.firstName} {request.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{request.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.requestReason && (
                      <p className="text-sm text-gray-700 mt-2">{request.requestReason}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Request Details and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                {selectedRequest 
                  ? "Review and take action on the selected request"
                  : "Select a request to view details"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRequest ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">
                        {selectedRequest.firstName} {selectedRequest.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedRequest.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedRequest.status)}
                        <Badge className={getStatusColor(selectedRequest.status)}>
                          {selectedRequest.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Request Date</label>
                      <p className="text-gray-900">
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {selectedRequest.requestReason && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Request Reason</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                        {selectedRequest.requestReason}
                      </p>
                    </div>
                  )}

                  {selectedRequest.status === 'pending' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Review Notes (Optional)
                        </label>
                        <Textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add notes about your decision..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleDecision('approved')}
                          disabled={approveMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Access
                        </Button>
                        <Button
                          onClick={() => handleDecision('rejected')}
                          disabled={approveMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Access
                        </Button>
                      </div>
                    </>
                  )}

                  {selectedRequest.status !== 'pending' && (
                    <div className="text-center py-8 text-gray-500">
                      This request has already been {selectedRequest.status}.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a request from the list to view details and take action.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}