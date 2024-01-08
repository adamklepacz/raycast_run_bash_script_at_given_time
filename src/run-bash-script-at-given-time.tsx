import { Action, ActionPanel, Form, showToast, Toast, ToastStyle, useNavigation } from "@raycast/api";
import { exec } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import React, { useEffect } from "react";
import { convertDateToCron } from "./convertDateToCron";

export default function Command() {
  const { push } = useNavigation();

  useEffect(() => {
    push(<MainForm />);
  }, []);

  return null;
}

function MainForm() {
  const [error, setError] = React.useState<string | undefined>(undefined);

  const handleSubmit = async (values: { date: Date; script: string }) => {
    const { date, script } = values;
    const id = Date.now();
    const homeDirectory = os.homedir();
    const filePath = `${homeDirectory}/auto_bash_${id}.sh`;

    // Convert the date to a cron-compatible format
    const cronDate = convertDateToCron(date);

    try {
      await fs.writeFile(filePath, script);
      await fs.chmod(filePath, "0755");

      // Schedule the script using cron
      const cronCommand = `echo "${cronDate} ${filePath}" | crontab -`;
      exec(cronCommand, (error: any) => {
        if (error) {
          setError(error.message);
          showToast(Toast.Style.Failure, "Failed to schedule script", error.message);
        } else {
          showToast(Toast.Style.Success, "Script scheduled successfully");
        }
      });
    } catch (error: any) {
      showToast(Toast.Style.Failure, "Failed to create script file", error.message);
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.DatePicker id="date" title="Date" />
      <Form.TextArea id="script" title="Script" placeholder="Enter your bash script here" />
      {error && <Form.TextField id="text" value={error} />}
    </Form>
  );
}
