import {
  Store, ChevronDown, ChevronLeft, ChevronRight, Bell, RefreshCw, History, SlidersHorizontal,
  ShoppingBag, Undo2, PackageCheck, Boxes, Receipt, CheckCircle2, AlertTriangle, AlertCircle,
  Search, Download, Upload, Plus, Minus, MoreHorizontal, TrendingUp, Wallet, Printer,
  ArrowUpRight, ArrowRight, User, CalendarDays, Package, Layers, SquarePen, Clock, X, Zap,
  PackageX, CreditCard, Copy, Mail, Trash2, Archive, ArchiveRestore, Check, Eye, FileText, Ban, Menu,
} from 'lucide-react'

const icons = {
  store: Store, chevronDown: ChevronDown, chevronLeft: ChevronLeft, chevronRight: ChevronRight,
  bell: Bell, refresh: RefreshCw, history: History, sliders: SlidersHorizontal, bag: ShoppingBag,
  undo: Undo2, packageCheck: PackageCheck, boxes: Boxes, receipt: Receipt, checkCircle: CheckCircle2,
  alert: AlertTriangle, alertCircle: AlertCircle, search: Search, download: Download, upload: Upload,
  plus: Plus, minus: Minus, more: MoreHorizontal, trendUp: TrendingUp, wallet: Wallet, printer: Printer,
  arrowUpRight: ArrowUpRight, arrowRight: ArrowRight, user: User, calendar: CalendarDays,
  package: Package, layers: Layers, edit: SquarePen, clock: Clock, close: X, zap: Zap,
  packageX: PackageX, creditCard: CreditCard, copy: Copy, mail: Mail, trash: Trash2, archive: Archive,
  unarchive: ArchiveRestore, check: Check, eye: Eye, file: FileText, ban: Ban, menu: Menu,
}

export default function Icon({ name, size = 16, className, ...props }) {
  const Cmp = icons[name]
  if (!Cmp) return null
  return <Cmp size={size} strokeWidth={1.75} className={className} aria-hidden="true" {...props} />
}