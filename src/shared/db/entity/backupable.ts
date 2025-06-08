export interface IBackUpable {
    transactionId: string | undefined;
}
export interface IFileBackUpable {
    cidId: string | undefined;
    fileId: string;
    mime: string;
}
