import swal from "sweetalert";

export class AlertService {
  static showSuccess(message: string): void {
    swal("Éxito", message, "success");
  }

  static showError(message: string): void {
    swal("Error", message, "error");
  }

  static showInfo(message: string): void {
    swal("Información", message, "info");
  }

  static showWarning(message: string): void {
    swal("Advertencia", message, "warning");
  }

  static showErrorWithCallback(message: string, callback: () => void): void {
    swal("Error", message, "error").then(() => {
      callback();
    });
  }

  static showConfirm(
    title: string,
    message: string,
    confirmButtonText = "Sí",
    cancelButtonText = "Cancelar"
  ): Promise<boolean> {
    return swal({
      title,
      text: message,
      icon: "warning",
      buttons: {
        cancel: {
          text: cancelButtonText,
          visible: true,
        },
        confirm: {
          text: confirmButtonText,
        },
      },
      dangerMode: true,
    }).then((confirmed) => Boolean(confirmed));
  }
}
