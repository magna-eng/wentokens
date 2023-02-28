import { tw } from 'typewind';
import { Icon } from '@iconify/react';
import type { ParseResult } from 'papaparse'
import { toast } from 'sonner';
import {
  useCSVReader,
} from 'react-papaparse';

interface ICSVUploadProps<T = any> {
  onUpload: (data: ParseResult<T>) => void;
}

export default function CSVUpload<T = any>({ onUpload }: ICSVUploadProps<T>) {
  const { CSVReader } = useCSVReader();

  return (
    <CSVReader
      header={false}
      worker
      onUploadAccepted={onUpload}
      onUploadRejected={() => toast.error('Upload rejected - check to make sure your CSV is properly formatted')}
      onDragOver={(event: DragEvent) => event.preventDefault()}
      onDragLeave={(event: DragEvent) => event.preventDefault()}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
      }: any) => {
        return <>
          <div
            className={tw
              .items_center
              .border_2.border_neutral_700.
              rounded_lg
              .flex.flex_col
              .h_full.justify_center.p_5.my_10
              .cursor_pointer
              .relative
              + " bg-neutral-700/[.08] hover:bg-neutral-700/[.16]"
            }
            {...getRootProps()}
          >
            <div className={tw.space_y_6.text_center.flex.flex_col.items_center}>
              <div className={tw.flex.justify_center.items_center.w_14.h_14.border_['1px'].border_neutral_700.rounded_lg}>
                <Icon width='25' className={tw.text_base_100} icon="ri:file-upload-fill" />
              </div>
              <h4 className={tw.text_base_100.text_sm}>Click to upload or drag and drop</h4>
              <p className={tw.text_neutral_400.text_sm}>.CSV (max 100mb)</p>
            </div>
          </div>
          {acceptedFile && <div
            className={tw
              .items_center
              .border_2.border_neutral_700.
              rounded_lg
              .flex.flex_col
              .h_full.justify_center.p_5.my_10.space_y_2
              .cursor_pointer
              .relative
              + " bg-neutral-700/[.08] hover:bg-neutral-700/[.16]"
            }
          >
            <div className={tw.flex.flex_row.w_full.items_center.justify_center}>
              <span className={tw.text_left.text_base_100}>{acceptedFile.name}</span>
              <div
                className={tw.text_right.ml_auto.cursor_pointer}
                {...getRemoveFileProps()}
                onMouseOver={(event: Event) => event.preventDefault()}
                onMouseOut={(event: Event) => event.preventDefault()}
              >
                <Icon width='15' className={tw.text_critical} icon="ri:delete-bin-fill" />
              </div>
            </div>
            <div className={tw.flex.flex_row.w_full}>
              <div className={tw.w_full.p_0.rounded_3xl.bg_neutral_700}>
                <ProgressBar className="!bg-primary !p-0 !rounded-3xl" />
              </div>
            </div>

          </div>}

        </>
      }}
    </CSVReader>
  );
}
