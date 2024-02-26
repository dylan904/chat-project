const fetchOptsPost = {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "api-key": "106846f57a3f48f28c9ca6b7437916dc",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "referrer": "https://oai.azure.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
}

const fetchOptsGet = {
    ...fetchOptsPost,
    body: null,
    method: 'GET'
}

class Assistant {
    async init(threadId) {
        if (!threadId) {
            threadId = await this.createThread()
        }
        this.threadId = threadId
    }

    async createThread() {
        const response = await fetch("https://bln-proddesign-assistant-test.openai.azure.com/openai/threads?api-version=2024-02-15-preview", fetchOptsPost)
        const thread = await response.json()
        return thread.id
    }

    async sendMessage(message) {
        const response = await fetch(`https://bln-proddesign-assistant-test.openai.azure.com/openai/threads/${this.threadId}/messages?api-version=2024-02-15-preview`, {
            ...fetchOptsPost,
            body: JSON.stringify({
                "content": message,
                "role": "user",
                "file_ids": []
            })
        })
        const {id: messageId} = await response.json()
        console.log('message sent', messageId)

        const { runId, requiredAction } = await this.waitForCompletedRun()

        console.log('done waiting', {runId, requiredAction})
        if (requiredAction) {
            console.log('required action', requiredAction)
            return requiredAction.submit_tool_outputs.tool_calls
        }

        return await this.getResponse(runId)
    }

    async waitForCompletedRun() {
        let runs = await this.checkRuns()
        let runId = runs.id

        while (runs.status !== 'completed') {
            console.log('runstatus', runs.status)
            if (runs.status === 'queued') {
                console.log('runs queued', runId)
                await this.sleep(500)
            } else if (runs.status === 'failed') {
                console.log('runs failed', runId)
                break
            } else if (runs.status === 'requires_action') {
                console.log('requires action')
                break;
            }
            else {
                console.log('uncaught status', runId, runs.status, runs)
                await this.sleep(500)
            }

            runs = await this.checkRun(runId)
        }

        console.log('runs completed', runId, runs.status, runs)
        return { runId, requiredAction: runs.required_action }
    }

    async getResponse(runId) {
        console.log('get response', runId)
        const res = await fetch(`https://bln-proddesign-assistant-test.openai.azure.com/openai/threads/${this.threadId}/messages?api-version=2024-02-15-preview&limit=10&order=desc`, fetchOptsGet)
        const { data: messages, hasMore } = await res.json()

        console.log('got messages', runId, messages)
        //const pendingIdx = messages.findIndex(m => m.run_id === runId)
        const response = messages.find(m => m.run_id === runId && m.role === 'assistant')
        if (response) {
            return response.content
        }
        else {
            if (hasMore) {
                console.log('no matching response? but has more messages', messages)
            }
            else {
                console.log('no matching response?', messages)
            }
        }
    }

    async checkRuns() {
        console.log('check runs', this.threadId)
        const response = await fetch(`https://bln-proddesign-assistant-test.openai.azure.com/openai/threads/${this.threadId}/runs?api-version=2024-02-15-preview`, { 
            ...fetchOptsPost, 
            body: JSON.stringify({ assistant_id: "asst_9WL6NEQ3K3vcPDRMLEaxCqYi" })
        })

        return await response.json()
    }

    async checkRun(runId) {
        const response = await fetch(`https://bln-proddesign-assistant-test.openai.azure.com/openai/threads/${this.threadId}/runs/${runId}?api-version=2024-02-15-preview`, fetchOptsGet)
        return await response.json()
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
  
export default new Assistant()
