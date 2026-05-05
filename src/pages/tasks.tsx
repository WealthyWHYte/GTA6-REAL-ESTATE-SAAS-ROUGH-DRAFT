import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ClipboardList,
  Plus,
  Calendar,
  Flag,
  User,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Task {
  id: string
  account_id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "done" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  due_date?: string
  property_id?: string
  created_at: string
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-500 bg-gray-500/20 border-gray-500",
  medium: "text-blue-500 bg-blue-500/20 border-blue-500",
  high: "text-orange-500 bg-orange-500/20 border-orange-500",
  urgent: "text-red-500 bg-red-500/20 border-red-500",
}

export default function TasksPage() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    due_date: "",
    property_id: "",
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("account_id", user.id)
        .order("due_date", { ascending: true, nullsFirst: false })

      return data || []
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          account_id: user.id,
          created_by: user.id,
          ...newTask,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setIsCreating(false)
      setNewTask({ title: "", description: "", priority: "medium", due_date: "", property_id: "" })
    },
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task["status"] }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
        .eq("id", taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setSelectedTask(null)
    },
  })

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return
    createTaskMutation.mutate()
  }

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true
    if (activeTab === "todo") return task.status === "todo"
    if (activeTab === "in_progress") return task.status === "in_progress"
    if (activeTab === "done") return task.status === "done"
    return true
  })

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length,
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date"
    const date = new Date(dateString)
    const isOverdue = date < new Date()
    return (
      <span className={isOverdue ? "text-red-500" : ""}>
        {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        {isOverdue && " (Overdue)"}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gta-blue mb-2 flex items-center gap-3">
              <ClipboardList className="w-8 h-8" />
              Tasks
            </h1>
            <p className="text-muted-foreground">
              Manage your to-dos and follow-ups
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">{stats.todo}</p>
                <p className="text-sm text-muted-foreground">To Do</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{stats.in_progress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{stats.done}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Tasks</CardTitle>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="todo">To Do</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="done">Done</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tasks in this view
              </p>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <Checkbox
                      checked={task.status === "done"}
                      onCheckedChange={(checked) =>
                        updateTaskStatusMutation.mutate({
                          taskId: task.id,
                          status: checked ? "done" : "todo",
                        })
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </span>
                        <Badge variant="outline" className={PRIORITY_COLORS[task.priority]}>
                          <Flag className="w-3 h-3 mr-1" />
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.due_date)}
                        </span>
                        {task.property_id && (
                          <span>Property: {task.property_id.substring(0, 8)}...</span>
                        )}
                      </div>
                    </div>
                    {task.status !== "done" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateTaskStatusMutation.mutate({
                            taskId: task.id,
                            status: task.status === "todo" ? "in_progress" : "done",
                          })
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreating} onOpenChange={(o) => !o && setIsCreating(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Follow up with agent about 123 Main St"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Additional details..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(v: any) => setNewTask({ ...newTask, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Task Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(o) => !o && setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              {selectedTask.description && (
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className={PRIORITY_COLORS[selectedTask.priority]}>
                  <Flag className="w-3 h-3 mr-1" />
                  {selectedTask.priority}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due: {formatDate(selectedTask.due_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select
                  value={selectedTask.status}
                  onValueChange={(v: any) =>
                    updateTaskStatusMutation.mutate({
                      taskId: selectedTask.id!,
                      status: v,
                    })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTaskMutation.mutate(selectedTask.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
