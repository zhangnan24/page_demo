import { Input, message, Upload } from "antd";
import * as XLSX from "xlsx";
import React, { useState } from "react";
import { keys, map } from "lodash";

const App = () => {
  const [readStr, setReadStr] = useState();

  // 读文件
  const handleReadFile = (file) => {
    const fileName = file.name;

    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      if (binaryStr) {
        const workbook = XLSX.read(binaryStr, {
          type: "binary",
          raw: true, // 避免错误的单元格内容格式转换
          codepage: fileName.endsWith(".csv") ? 65001 : undefined, // 如果是csv文件，需要显式指定UTF-8避免乱码问题；xlsx则不需要
        });
        // const sheetName = workbook.SheetNames[0];

        const res = [];

        workbook.SheetNames.forEach((s) => {
          const worksheet = workbook.Sheets[s];
          const jsonList = XLSX.utils.sheet_to_json(worksheet);
          const header = jsonList[0];
          keys(header).forEach((k) => {
            const matchedList = map(jsonList, (item) => item[k]).filter(
              Boolean
            );
            const formatedStr = matchedList
              .join("、")
              .replaceAll("，", "、")
              .replace(/\s+/g, "、")
              .replace(/、{2,}/g, '、');

            res.push(`${s}_${k}：${formatedStr}`);
          });
        });

        setReadStr(res.join("\n\n"));
      }
    };

    reader.onerror = () => {
      message.error("文件读取失败！");
    };

    reader.readAsArrayBuffer(file);
    return false; // 阻止默认上传行为
  };

  return (
    <div style={{ padding: 50 }}>
      <h1 style={{ textAlign: "center", marginBottom: 50 }}>
        声音合成链接 （
        <span style={{ color: "royalblue" }}>男声选 Yunyang (Male)</span>）：
        <a
          href="https://luvvoice.com/zh"
          target="_blank"
          rel="noopener noreferrer"
        >
          Luvvoice
        </a>
      </h1>

      <Upload.Dragger
        beforeUpload={handleReadFile}
        showUploadList={false}
        style={{ marginBottom: 80 }}
      >
        <div style={{ margin: "200px 0" }}>
          <h1>点击/拖拽excel进行读取</h1>
          <h3 style={{ color: "red", margin: 0 }}>先删除无关行、无关列，并保证第一行为表头</h3>
          <h3 style={{ color: "red", margin: 0 }}>表头不要使用合并单元格</h3>
        </div>
      </Upload.Dragger>

      <h1 style={{ textAlign: "center" }}>Excel读取结果：</h1>
      <Input.TextArea
        autoSize
        value={readStr}
        onChange={(e) => setReadStr(e.target.value)}
      />
    </div>
  );
};

export default App;
