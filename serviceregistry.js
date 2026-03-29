// ==========================================
// User Views
// ==========================================
import HomeView from "../features/home/HomeView";

// Customer
import CifCreationView from "../features/customer/CifCreationView";
import CifCreationV2View from "../features/customer/CifCreationV2View";
import CkycView from "../features/customer/CkycView";
import SocialAttributeView from "../features/customer/SocialAttributeView";
import AmendView from "../features/customer/AmendView";
import PanCifView from "../features/customer/PanCifView";
import NocView from "../features/customer/NocView";
import CifScrutinyView from "../features/customer/CifScrutinyView";
import Form60View from "../features/customer/Form60View";
import FatkaView from "../features/customer/FatkaView";

// Accounts
import DepositAccountView from "../features/accounts/DepositAccountView";
import LoanAccountView from "../features/accounts/LoanAccountView";
import CcodAccountView from "../features/accounts/CcodAccountView";
import PpfView from "../features/accounts/PpfView";
import RdView from "../features/accounts/RdView";
import KccView from "../features/accounts/KccView";
import ModView from "../features/accounts/ModView";
import FoView from "../features/accounts/FoView";
import ContingentView from "../features/accounts/ContingentView";
import AccountClosureView from "../features/accounts/AccountClosureView";

// Teller
import TellerResetView from "../features/teller/TellerResetView";
import TellerSignonView from "../features/teller/TellerSignonView";
import TellerCreationView from "../features/teller/TellerCreationView";

// Enquiry
import MobileEnquiryView from "../features/enquiry/MobileEnquiryView";
import AccountEnquiryView from "../features/enquiry/AccountEnquiryView";
import CustomerEnquiryView from "../features/enquiry/CustomerEnquiryView";

// Financial & Reporting & Error
import FundTransferView from "../features/financial/FundTransferView";
import Account_to_AccountTransferView from "../features/financial/Account_to_AccountTransferview";
import ExcelBatchView from "../features/reporting/ExcelBatchView";
import ErrorResolutionCentreView from "../features/error/ErrorResolutionCentreView";
import ComingSoonView from "../components/ui/ComingSoonView";

// ==========================================
// Admin Views
// ==========================================
import AdminDashboard from "../features/admin/AdminDashboard";
import UserManagement from "../features/admin/UserManagement";
import ActivityLogs from "../features/admin/ActivityLogs";
import userDetails from "../features/admin/UserDetails";
import CreateUser from "../features/admin/CreateUser";
import ResetPassword from "../features/admin/ResetPassword";
import UnlockUser from "../features/admin/UnlockUser";
import Broadcast from "../features/admin/Broadcast";
import HealthCheck from "../features/admin/HealthCheck";
import AuditTrail from "../features/admin/AuditTrail";

// ==========================================
// REGISTRY MAPPING
// ==========================================
export const ServiceRegistry = {
    // Core
    home: HomeView,

    // Customer
    cif: CifCreationView,
    cifv2: CifCreationV2View,
    ckyc: CkycView,
    social: SocialAttributeView,
    amend: AmendView,
    pancif: PanCifView,
    noc: NocView,
    cifscrutiny: CifScrutinyView,
    form60: Form60View,
    fatka: FatkaView,

    // Accounts
    deposit: DepositAccountView,
    loan: LoanAccountView,
    ccod: CcodAccountView,
    ppf: PpfView,
    rd: RdView,
    kcc: KccView,
    mod: ModView,
    fo: FoView,
    contigent: ContingentView,
    accountclosure: AccountClosureView,

    // Teller
    tellerreset: TellerResetView,
    tellersignon: TellerSignonView,
    tellercreation: TellerCreationView,

    // Enquiry
    mobileenquiry: MobileEnquiryView,
    accountenquiry: AccountEnquiryView,
    customerenquiry: CustomerEnquiryView,

    // Financial
    // fundtransfer: FundTransferView,
    acc_to_acc: Account_to_AccountTransferView,
    cash_withdrawal: () => <ComingSoonView title="Cash Withdrawal" />,
    bgl_to_bgl: () => <ComingSoonView title="BGL to BGL" />,


    // Reporting & Error
    excel: ExcelBatchView,
    error: ErrorResolutionCentreView,

    // Admin (Requires special props/handling in Dashboard.js)
    admin_dashboard: AdminDashboard,
    user_management: UserManagement,
    activity_logs: ActivityLogs,
    user_detail: userDetails,
    admin_create_user: CreateUser,
    reset_password: ResetPassword,
    unlock_user: UnlockUser,
    admin_broadcast: Broadcast,
    admin_health: HealthCheck,
    admin_audit: AuditTrail,
};
