import * as service from '../src/service'

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
        }).rejects.toThrowError('Cannot resolve DID');
    });

    // Wrong Infura project id test
    test('Should throw error when INFURA_PID is not set', () => {
        const OLD_ENV = process.env.INFURA_PID;
        process.env.INFURA_PID = '';
        expect(() => {
            service.getInfuraResolver()
        }).toThrowError('Cannot import Infura project ID');
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
        }).rejects.toThrowError('Cannot verify VC');
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

});
