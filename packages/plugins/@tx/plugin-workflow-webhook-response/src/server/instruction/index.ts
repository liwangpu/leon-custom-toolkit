import { Instruction, JOB_STATUS } from '@nocobase/plugin-workflow';
import { WEBHOOK_DOMAIN_NAME } from '../../enums';

export class WebhookResponseInstruction extends Instruction {
    async run(node, input, processor) {
        try {
            // @ts-ignore
            const { db } = this.workflow.app.dataSourceManager.dataSources.get('main').collectionManager;
            if (!db) {
                throw new Error(`main is not database`);
            }

            const dbWebhookId = processor.execution?.context?.webhookId || '';
            const dbRepository = db.getRepository(WEBHOOK_DOMAIN_NAME);
            const dbWebhook = await dbRepository.findOne({
                filter: {
                    id: dbWebhookId,
                },
            });

            if (!dbWebhook) {
                throw new Error(`${dbWebhookId} is not found`);
            }

            const {
                statusCode,
                contentType,
                responseHeaders,
                responseBody
            } = processor.getParsedValue(node.config, node.id);

            const result = { statusCode, contentType, responseHeaders, responseBody };

            await dbRepository.update({
                filter: {
                    id: dbWebhookId,
                },
                values: {
                    response: JSON.stringify(result),
                }
            });

            return {
                status: JOB_STATUS.RESOLVED,
                result
            };
        } catch (e) {
            this.workflow.app.log.error(e);
            return {
                status: JOB_STATUS.ERROR,
                error: e,
            };
        }
    }
}