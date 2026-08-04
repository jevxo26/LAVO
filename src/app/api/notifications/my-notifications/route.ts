import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";

// In-memory / initial store fallback for user notifications
const MOCK_NOTIFICATIONS: Record<string, Array<{ id: string; title: string; message: string; timestamp: string; isRead: boolean }>> = {};

export async function GET(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  const userId = auth.user!.id;
  const list = MOCK_NOTIFICATIONS[userId] || [
    {
      id: "notif-1",
      title: "Welcome to Laundrix 🧺",
      message: "Your account is active. Start exploring services or manage your profile.",
      timestamp: "Just now",
      isRead: false,
    },
    {
      id: "notif-2",
      title: "System Update Complete",
      message: "Role permissions and system settings have been updated.",
      timestamp: "2 hours ago",
      isRead: false,
    },
  ];

  MOCK_NOTIFICATIONS[userId] = list;
  const unreadCount = list.filter((n) => !n.isRead).length;

  return NextResponse.json({
    success: true,
    data: list,
    unreadCount,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  const userId = auth.user!.id;
  const list = MOCK_NOTIFICATIONS[userId] || [];
  const updatedList = list.map((n) => ({ ...n, isRead: true }));
  MOCK_NOTIFICATIONS[userId] = updatedList;

  return NextResponse.json({
    success: true,
    message: "All notifications marked as read",
    data: updatedList,
    unreadCount: 0,
  });
}
