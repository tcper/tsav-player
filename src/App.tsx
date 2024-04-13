import React, { useEffect, useRef } from "react";
import { NextUIProvider } from "@nextui-org/react";
import {
  Button, Listbox, ListboxItem, Chip, Avatar, CircularProgress,
  Input, Checkbox,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@nextui-org/react";
import { ListboxWrapper } from "./ListboxWrapper";

export const App = () => {
  const filesFromStore = localStorage.getItem("files") ? JSON.parse(localStorage.getItem("files")) : [];
  const [files, setFiles] = React.useState(filesFromStore);
  const [selected, setSelected] = React.useState('');

  const [transStatus, setTransStatus] = React.useState(0);
  const [errorMsg, setErrorMsg] = React.useState('');

  const cudaFromStore = localStorage.getItem('cuda')
  const [cuda, setCuda] = React.useState(cudaFromStore === 'true');

  const saveData = (data) => {
    if (!data) return console.error("No data to save")
    const { name, wav } = data
    const files = localStorage.getItem("files") ? JSON.parse(localStorage.getItem("files")) : [];
    const pair = files.find((file) => file?.name === name)
    if (pair) {
      pair.wav = wav
    } else {
      files.push({ name, wav })
    }
    localStorage.setItem("files", JSON.stringify(files))
    setFiles(files)
  }

  const player = useRef(null)
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const openFile = () => {
    window.api.send('toMain', { event: 'openFile', cuda });
  }

  useEffect(() => {
    window.api.receive('toRender', (data) => {
      const { event } = data
      if (event === 'start-transcoding') {
        setTransStatus(0)
        onOpen()
        return
      }
      if (event === 'error') {
        // onClose()
        setTransStatus(2)
        setErrorMsg(data.msg)
        return console.error(data.msg)
      }
      if (event === 'cancel') {
        // onOpenChange()
        return console.log("no file selected");
      }
      if (event !== 'completed') return
      setTransStatus(1)
      saveData(data)
      const { name, wav } = data
      if (!wav) return console.error("No wav file")
      player.current.src = wav
      player.current.play()
    });
  }, [])
  const [values, setValues] = React.useState();

  return <div className="h-screen p-8">
    <NextUIProvider className="h-full">
      <div className="grid gap-4 h-full" style={{ gridTemplateRows: 'auto auto 2fr auto auto' }}>
        <Button color="primary" onClick={openFile}>
          Open TSAC file
        </Button>
        <Checkbox isSelected={cuda} onValueChange={value => {
          localStorage.setItem('cuda', value)
          setCuda(value)

        }}>
          I have CUDA
        </Checkbox>
        <ListboxWrapper>
          <Listbox
            classNames={{
              base: "w-full h-full",
              list: "max-h-[300px] overflow-scroll ",
            }}
            topContent={"Transformed files"}
            defaultSelectedKeys={["1"]}
            items={files}
            label="Assigned to"
            selectionMode="single"
            onSelectionChange={item => {
              setValues(item)
            }}
            variant="flat"
          >
            {(item) => (
              <ListboxItem key={item.name} textValue={item.name}>
                <div className="flex gap-2 items-center" onClick={() => {
                  setSelected(item.wav)
                  player.current.src = item.wav
                  player.current.play()
                }}>
                  <Avatar alt={item.name} className="flex-shrink-0" size="sm" name={item.name} />
                  <div className="flex flex-col">
                    <span className="text-small">{item.name}</span>
                    <span className="text-tiny text-default-400">{item.path}</span>
                  </div>
                </div>
              </ListboxItem>
            )}
          </Listbox>
        </ListboxWrapper>
        <div>
          <Input readonly={true} value={selected} />
        </div>
        <audio controls="controls" id="player" ref={player} className="w-full"></audio>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1"></ModalHeader>
              <ModalBody>
                {transStatus === 0 && <>
                  <CircularProgress aria-label="Loading..." />
                  Waiting for TSAV file ready...
                </>}

                {transStatus === 1 && <>
                  <Chip color="success" variant="light" />
                  Transcoding completed
                </>}

                {transStatus === 2 && <>
                  <Chip color="error" variant="light" />
                  {errorMsg}
                </>}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </NextUIProvider>
  </div>
}