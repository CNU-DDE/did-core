import * as service from '../service'
import * as errors from '../errors'

describe('Test group #1: DID and DID resolving', () => {

    // DID resolving test
    test('Should resolve DID', async () => {
        expect(await service.resolveDID(
            '0x031ef767936996de95f5be7b36fada08d070b97e85d874ce23e5f9fcbdf7149aa2'
        )).toBeTruthy();
    });

    // Wrong DID test
    test('Should throw error for wrong identifier', () => {
        expect(async () => {
            await service.resolveDID('wrong-identifier')
        }).rejects.toThrowError(new errors.ResolveDIDFailureError());
    });

    // Wrong Infura project id test
    test('Should throw error when INFURA_PID is not set', () => {
        const OLD_ENV = process.env.INFURA_PID;
        process.env.INFURA_PID = '';
        expect(() => {
            service.getInfuraResolver()
        }).toThrowError(new errors.InfuraProjectIdImportFailureError());
        process.env.INFURA_PID = OLD_ENV;
    });

});

describe('Test group #2: VC test', () => {

    // Create VC test
    test('Should create VC', async () => {
        expect(await service.createVC(
            'did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4',
            {
                degree: {
                    type: 'BachelorDegree',
                    name: 'CSE'
                }
            },
            '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
            'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75'
        )).toBeTruthy();
    });

    // Verify VC test
    // TODO: verification is failed because the resolver is configured to use ropsten, not mainnet
    //      but sample key is on mainnet
    test('Should verify VC successfully', async () => {
        const testVC = "eyJhbGciOiJFUzI1NkstUiIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRlZ3JlZSI6eyJ0eXBlIjoiQmFjaGVsb3JEZWdyZWUiLCJuYW1lIjoiQ1NFIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNTYyOTUwMjgyLCJpc3MiOiJkaWQ6ZXRocjoweEYxMjMyRjg0MGYzYUQ3ZDIzRmNEYUE4NGQ2QzY2ZGFjMjRFRmIxOTgifQ.La-maDcP8NXaucFDwSK-rD4DYmcIvBCQa4CA3q-05bCzdHHf6ZSdHQWMJuwn34vIMAl6tBCS992QKrWwEZT5QQA";
        expect(await service.verifyVC(testVC)).toBeTruthy();
    });

    // Verify failure test
    test('Should not verify VC and throw error', async () => {
        const testVC = "eyJhbGciOiJFVzI1NkstUiIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRlZ3JlZSI6eyJ0eXBlIjoiQmFjaGVsb3JEZWdyZWUiLCJuYW1lIjoiQ1NFIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNTYyOTUwMjgyLCJpc3MiOiJkaWQ6ZXRocjoweEYxMjMyRjg0MGYzYUQ3ZDIzRmNEYUE4NGQ2QzY2ZGFjMjRFRmIxOTgifQ.La-maDcP8NXaucFDwSK-rD4DYmcIvBCQa4CA3q-05bCzdHHf6ZSdHQWMJuwn34vIMAl6tBCS992QKrWwEZT5QQA";
        expect(async () => {
            await service.verifyVC(testVC)
        }).rejects.toThrowError(new errors.VerifyVCFailureError());
    });

});

describe('Test group #3: VP test', () => {

    // Create VP test
    test('Should create VP', async () => {
        const testVC = "eyJhbGciOiJFUzI1NkstUiIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImRlZ3JlZSI6eyJ0eXBlIjoiQmFjaGVsb3JEZWdyZWUiLCJuYW1lIjoiQ1NFIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNTYyOTUwMjgyLCJpc3MiOiJkaWQ6ZXRocjoweEYxMjMyRjg0MGYzYUQ3ZDIzRmNEYUE4NGQ2QzY2ZGFjMjRFRmIxOTgifQ.La-maDcP8NXaucFDwSK-rD4DYmcIvBCQa4CA3q-05bCzdHHf6ZSdHQWMJuwn34vIMAl6tBCS992QKrWwEZT5QQA";

        expect(await service.createVP(
            '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
            'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75',
            [ testVC ]
        )).toBeTruthy();
    });

    // Verify VP test
    // TODO: verification is failed because the resolver is configured to use ropsten, not mainnet
    //      but sample key is on mainnet
    test('Should verify VP successfully', async () => {
        const testVP = "eyJhbGciOiJFUzI1NkstUiIsInR5cCI6IkpXVCJ9.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGVXpJMU5rc3RVaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoyWXlJNmV5SkFZMjl1ZEdWNGRDSTZXeUpvZEhSd2N6b3ZMM2QzZHk1M015NXZjbWN2TWpBeE9DOWpjbVZrWlc1MGFXRnNjeTkyTVNKZExDSjBlWEJsSWpwYklsWmxjbWxtYVdGaWJHVkRjbVZrWlc1MGFXRnNJbDBzSW1OeVpXUmxiblJwWVd4VGRXSnFaV04wSWpwN0ltUmxaM0psWlNJNmV5SjBlWEJsSWpvaVFtRmphR1ZzYjNKRVpXZHlaV1VpTENKdVlXMWxJam9pUTFORkluMTlmU3dpYzNWaUlqb2laR2xrT21WMGFISTZNSGcwTXpWa1pqTmxaR0UxTnpFMU5HTm1PR05tTnpreU5qQTNPVGc0TVdZeU9URXlaalUwWkdJMElpd2libUptSWpveE5UWXlPVFV3TWpneUxDSnBjM01pT2lKa2FXUTZaWFJvY2pvd2VFWXhNak15UmpnME1HWXpZVVEzWkRJelJtTkVZVUU0TkdRMlF6WTJaR0ZqTWpSRlJtSXhPVGdpZlEuTGEtbWFEY1A4TlhhdWNGRHdTSy1yRDREWW1jSXZCQ1FhNENBM3EtMDViQ3pkSEhmNlpTZEhRV01KdXduMzR2SU1BbDZ0QkNTOTkyUUtyV3dFWlQ1UVFBIl19LCJpc3MiOiJkaWQ6ZXRocjoweEYxMjMyRjg0MGYzYUQ3ZDIzRmNEYUE4NGQ2QzY2ZGFjMjRFRmIxOTgifQ.LN2gtVLkEISqjmByzySUm9s-fBXPyFqgv20R0bzDBvTem2HSTMJlHCiUBI3iWfqzO9uI8Kk-DDnw-M9GnA1CKwE";
        expect(await service.verifyVP(testVP)).toBeTruthy();
    });

    // Verify failure test
    test('Should not verify VP and throw error', async () => {
        const testVP = "eyJhbGcioiJFUzI1NkstUiIsInR5cCI6IkpXVCJ9.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGVXpJMU5rc3RVaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoyWXlJNmV5SkFZMjl1ZEdWNGRDSTZXeUpvZEhSd2N6b3ZMM2QzZHk1M015NXZjbWN2TWpBeE9DOWpjbVZrWlc1MGFXRnNjeTkyTVNKZExDSjBlWEJsSWpwYklsWmxjbWxtYVdGaWJHVkRjbVZrWlc1MGFXRnNJbDBzSW1OeVpXUmxiblJwWVd4VGRXSnFaV04wSWpwN0ltUmxaM0psWlNJNmV5SjBlWEJsSWpvaVFtRmphR1ZzYjNKRVpXZHlaV1VpTENKdVlXMWxJam9pUTFORkluMTlmU3dpYzNWaUlqb2laR2xrT21WMGFISTZNSGcwTXpWa1pqTmxaR0UxTnpFMU5HTm1PR05tTnpreU5qQTNPVGc0TVdZeU9URXlaalUwWkdJMElpd2libUptSWpveE5UWXlPVFV3TWpneUxDSnBjM01pT2lKa2FXUTZaWFJvY2pvd2VFWXhNak15UmpnME1HWXpZVVEzWkRJelJtTkVZVUU0TkdRMlF6WTJaR0ZqTWpSRlJtSXhPVGdpZlEuTGEtbWFEY1A4TlhhdWNGRHdTSy1yRDREWW1jSXZCQ1FhNENBM3EtMDViQ3pkSEhmNlpTZEhRV01KdXduMzR2SU1BbDZ0QkNTOTkyUUtyV3dFWlQ1UVFBIl19LCJpc3MiOiJkaWQ6ZXRocjoweEYxMjMyRjg0MGYzYUQ3ZDIzRmNEYUE4NGQ2QzY2ZGFjMjRFRmIxOTgifQ.LN2gtVLkEISqjmByzySUm9s-fBXPyFqgv20R0bzDBvTem2HSTMJlHCiUBI3iWfqzO9uI8Kk-DDnw-M9GnA1CKwE";
        expect(async () => {
            await service.verifyVP(testVP)
        }).rejects.toThrowError(new errors.VerifyVPFailureError());
    });

});
