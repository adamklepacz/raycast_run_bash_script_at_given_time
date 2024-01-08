import { Action, ActionPanel, Form, popToRoot, showToast, Toast, useNavigation } from "@raycast/api";
import { exec } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import React, { useEffect } from "react";
import { convertDateToCron } from "./convertDateToCron";

export default function Command() {
  return <MainForm />;
}

function MainForm() {
  const [error, setError] = React.useState<string | undefined>(undefined);

  const handleSubmit = async (values: { date: Date; script: string; directory?: string }) => {
    const { date, script, directory } = values;
    const id = Date.now();
    const homeDirectory = os.homedir();
    const filePath = `${homeDirectory}/auto_bash_${id}.sh`;

    // Convert the date to a cron-compatible format
    const cronDate = convertDateToCron(date);

    // Prepend the cd command to the script
    const targetDirectory = directory || homeDirectory;
    const fullScript = `cd ${targetDirectory}\n${script}`;

    try {
      await fs.writeFile(filePath, fullScript);
      await fs.chmod(filePath, "0755");

      // Schedule the script using cron
      const cronCommand = `echo "${cronDate} ${filePath}" | crontab -`;
      exec(cronCommand, (error: any) => {
        if (error) {
          setError(error.message);
          showToast(Toast.Style.Failure, "Failed to schedule script", error.message);
        } else {
          showToast(Toast.Style.Success, "Script scheduled successfully");
          popToRoot();
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
      <Form.FilePicker
        title="Directory from where the script will be executed"
        id="directory"
        allowMultipleSelection={false}
        canChooseDirectories
        canChooseFiles={false}
      />
      <Form.DatePicker id="date" title="Date" />
      <Form.TextArea id="script" title="Script" placeholder="Enter your bash script here" />
      {error && <Form.TextField id="text" value={error} />}
    </Form>
  );
}
